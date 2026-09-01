package handler

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"real-time-forum/config"
	"real-time-forum/utils"
)

func FeedHanlder(w http.ResponseWriter, r *http.Request) {
	utils.EnableCors(w)

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method == http.MethodPost {
		userID, err := utils.CheckSession(w, r)
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(utils.ResponseApi{Success: false, Message: "Authentication required.", Error: "authorized_error"})
			return
		}

		var action utils.Actions
		if err := json.NewDecoder(r.Body).Decode(&action); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(utils.ResponseApi{Success: false, Message: "invalid json", Error: "request_error"})
			return
		}

		if action.Actions == "like" {
			var currentVote int
			err := config.Conn.QueryRow("SELECT vote_value FROM votes WHERE post_id = ? AND user_id = ?", action.ID, userID).Scan(&currentVote)
			if err == sql.ErrNoRows {
				_, err = config.Conn.Exec("INSERT INTO votes(post_id, user_id, vote_value) VALUES(?, ?, 1)", action.ID, userID)
				if err != nil {
					w.WriteHeader(http.StatusInternalServerError)
					json.NewEncoder(w).Encode(utils.ResponseApi{Success: false, Message: "Internal Server Error", Error: "server_error"})
					return
				}
				w.WriteHeader(http.StatusAccepted)
				json.NewEncoder(w).Encode(map[string]string{"message": "liked"})
				return
			} else if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(utils.ResponseApi{Success: false, Message: "Internal Server Error", Error: "server_error"})
				return
			}

			if currentVote == 1 {
				_, err = config.Conn.Exec("DELETE FROM votes WHERE post_id = ? AND user_id = ?", action.ID, userID)
				if err != nil {
					w.WriteHeader(http.StatusInternalServerError)
					json.NewEncoder(w).Encode(utils.ResponseApi{Success: false, Message: "Internal Server Error", Error: "server_error"})
					return
				}
				w.WriteHeader(http.StatusAccepted)
				json.NewEncoder(w).Encode(map[string]string{"message": "unliked"})
				return
			}

			_, err = config.Conn.Exec("UPDATE votes SET vote_value = 1 WHERE post_id = ? AND user_id = ?", action.ID, userID)
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(utils.ResponseApi{Success: false, Message: "Internal Server Error", Error: "server_error"})
				return
			}
			w.WriteHeader(http.StatusAccepted)
			json.NewEncoder(w).Encode(map[string]string{"message": "liked"})
			return
		}

		if action.Actions == "dislike" {
			var currentVote int
			err := config.Conn.QueryRow("SELECT vote_value FROM votes WHERE post_id = ? AND user_id = ?", action.ID, userID).Scan(&currentVote)
			if err == sql.ErrNoRows {
				_, err = config.Conn.Exec("INSERT INTO votes(post_id, user_id, vote_value) VALUES(?, ?, -1)", action.ID, userID)
				if err != nil {
					w.WriteHeader(http.StatusInternalServerError)
					json.NewEncoder(w).Encode(utils.ResponseApi{Success: false, Message: "Internal Server Error", Error: "server_error"})
					return
				}
				w.WriteHeader(http.StatusAccepted)
				json.NewEncoder(w).Encode(map[string]string{"message": "disliked"})
				return
			} else if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(utils.ResponseApi{Success: false, Message: "Internal Server Error", Error: "server_error"})
				return
			}

			if currentVote == -1 {
				_, err = config.Conn.Exec("DELETE FROM votes WHERE post_id = ? AND user_id = ?", action.ID, userID)
				if err != nil {
					w.WriteHeader(http.StatusInternalServerError)
					json.NewEncoder(w).Encode(utils.ResponseApi{Success: false, Message: "Internal Server Error", Error: "server_error"})
					return
				}
				w.WriteHeader(http.StatusAccepted)
				json.NewEncoder(w).Encode(map[string]string{"message": "undisliked"})
				return
			}

			_, err = config.Conn.Exec("UPDATE votes SET vote_value = -1 WHERE post_id = ? AND user_id = ?", action.ID, userID)
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(utils.ResponseApi{Success: false, Message: "Internal Server Error", Error: "server_error"})
				return
			}
			w.WriteHeader(http.StatusAccepted)
			json.NewEncoder(w).Encode(map[string]string{"message": "disliked"})
			return
		}

		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(utils.ResponseApi{Success: false, Message: "unknown action", Error: "request_error"})
		return
	}

	if r.Method == http.MethodGet {
		userID := 0
		if id, err := utils.CheckSession(w, r); err == nil {
			userID = id
		}

		limit := 0
		offset := 0
		if l := r.URL.Query().Get("limit"); l != "" {
			if v, err := strconv.Atoi(l); err == nil && v > 0 {
				limit = v
			}
		}
		if o := r.URL.Query().Get("offset"); o != "" {
			if v, err := strconv.Atoi(o); err == nil && v >= 0 {
				offset = v
			}
		}

		baseQuery := `SELECT
            posts.id,
            posts.title,
            posts.content,
            posts.image_url,
            posts.created_at,
            users.nick_name,
            EXISTS (SELECT 1 FROM votes WHERE post_id = posts.id AND user_id = ? AND vote_value = 1) AS is_liked,
            EXISTS (SELECT 1 FROM votes WHERE post_id = posts.id AND user_id = ? AND vote_value = -1) AS is_disliked,
            (SELECT COUNT(*) FROM votes WHERE post_id = posts.id AND vote_value = 1) AS like_count,
            (SELECT COUNT(*) FROM votes WHERE post_id = posts.id AND vote_value = -1) AS dislike_count,
            (SELECT COUNT(*) FROM comments WHERE post_id = posts.id) AS comment_count,
            categories.name AS category_name
        FROM posts
        INNER JOIN users ON posts.user_id = users.id
        LEFT JOIN post_categories ON post_categories.post_id = posts.id
        LEFT JOIN categories ON categories.id = post_categories.category_id
        ORDER BY posts.created_at DESC`

		var rows *sql.Rows
		var err error
		if limit > 0 {
			q := baseQuery + " LIMIT ? OFFSET ?"
			rows, err = config.Conn.Query(q, userID, userID, limit, offset)
		} else {
			rows, err = config.Conn.Query(baseQuery, userID, userID)
		}
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(utils.ResponseApi{Success: false, Message: "Internal Server Error", Error: "server_error"})
			return
		}
		defer rows.Close()

		var posts []utils.Posts
		for rows.Next() {
			var p utils.Posts
			var created time.Time
			var categoryName sql.NullString
			if err := rows.Scan(&p.Id, &p.Title, &p.Content, &p.Image_url, &created, &p.UserName, &p.Isliked, &p.IsDisliked, &p.LikeCount, &p.DislikeCount, &p.CommentsCount, &categoryName); err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(utils.ResponseApi{Success: false, Message: "Internal Server Error", Error: "server_error"})
				return
			}
			p.Creat_at = utils.GetDuration(created)
			p.CategoryName = categoryName.String
			posts = append(posts, p)
		}
		if err := rows.Err(); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(utils.ResponseApi{Success: false, Message: "Internal Server Error", Error: "server_error"})
			return
		}

		feed := utils.FeedStruct{AllPosts: posts}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(utils.ResponseApi{Success: true, Data: feed})
		return
	}

	w.WriteHeader(http.StatusMethodNotAllowed)
	json.NewEncoder(w).Encode(utils.ResponseApi{Success: false, Message: "Method Not Allowed", Error: "method_error"})
}
