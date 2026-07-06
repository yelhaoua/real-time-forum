package handler

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"real-time-forum/config"
	"real-time-forum/utils"
)

func FeedHanlder(w http.ResponseWriter, r *http.Request) {
	utils.EnableCors(w)
	var action utils.Actions
	var userID int

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	
	if r.Method == http.MethodPost {
		userID, err := utils.CheckSession(w, r)
		if err != nil {
	
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(utils.ResponseApi{
				Success: false,
				Message: "Authentication required.",
				Error:   "authorized_error",
			})
			return
		}

		err = json.NewDecoder(r.Body).Decode(&action)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(utils.ResponseApi{
				Success: false,
				Message: "error in json body",
				Error:   "request_error",
			})
			return
		}

		if action.Actions == "like" {
			var currentVote int
			err := config.Conn.QueryRow(
				"SELECT vote_value FROM votes WHERE post_id = ? AND user_id = ?",
				action.ID,
				userID,
			).Scan(&currentVote)

			w.Header().Set("Content-Type", "application/json")

			if err == sql.ErrNoRows {
				_, err = config.Conn.Exec(
					"INSERT INTO votes(post_id, user_id, vote_value) VALUES(?, ?, 1)",
					action.ID,
					userID,
				)
				if err != nil {
					w.WriteHeader(http.StatusInternalServerError)
					json.NewEncoder(w).Encode(utils.ResponseApi{
						Success: false,
						Message: "Internal Server Error",
						Error:   "server_error",
					})
					return
				}
				w.WriteHeader(http.StatusAccepted)
				json.NewEncoder(w).Encode(map[string]string{"message": "liked"})
				return

			} else if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(utils.ResponseApi{
					Success: false,
					Message: "Internal Server Error",
					Error:   "server_error",
				})
				return
			}

			if currentVote == 1 {
				_, err = config.Conn.Exec("DELETE FROM votes WHERE post_id = ? AND user_id = ?", action.ID, userID)
				if err != nil {
					w.WriteHeader(http.StatusInternalServerError)
					json.NewEncoder(w).Encode(utils.ResponseApi{
						Success: false,
						Message: "Internal Server Error",
						Error:   "server_error",
					})
					return
				}
				w.WriteHeader(http.StatusAccepted)
				json.NewEncoder(w).Encode(map[string]string{"message": "unliked"})
				return
			} else {
				_, err = config.Conn.Exec("UPDATE votes SET vote_value = 1 WHERE post_id = ? AND user_id = ?", action.ID, userID)
				if err != nil {
					w.WriteHeader(http.StatusInternalServerError)
					json.NewEncoder(w).Encode(utils.ResponseApi{
						Success: false,
						Message: "Internal Server Error",
						Error:   "server_error",
					})
					return
				}
				w.WriteHeader(http.StatusAccepted)
				json.NewEncoder(w).Encode(map[string]string{"message": "liked"})
				return
			}
		}
	} else if r.Method == http.MethodGet {

		query := `SELECT
            posts.id,
            posts.title,
            posts.content,
            posts.image_url,
            posts.created_at,
            users.username,
            EXISTS (
                SELECT 1 FROM votes
                WHERE post_id = posts.id
                AND user_id = ?
                AND vote_value = 1
            ) AS is_liked,
            EXISTS (
                SELECT 1 FROM votes
                WHERE post_id = posts.id
                AND user_id = ?
                AND vote_value = -1
            ) AS is_disliked,
            (SELECT COUNT(*) FROM votes WHERE post_id = posts.id AND vote_value = 1) AS like_count,
            (SELECT COUNT(*) FROM votes WHERE post_id = posts.id AND vote_value = -1) AS dislike_count
        FROM posts
        INNER JOIN users ON posts.user_id = users.id
        ORDER BY posts.created_at DESC;`

		potes, err := config.Conn.Query(query, userID, userID)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(utils.ResponseApi{
				Success: false,
				Message: "Internal Server Error",
				Error:   "server_error",
			})
			return
		}
		defer potes.Close()
		var allpostes []utils.Posts

		for potes.Next() {
			var p utils.Posts
			var Time time.Time
			err := potes.Scan(&p.Id, &p.Title, &p.Content, &p.Image_url, &Time, &p.UserName, &p.Isliked, &p.IsDisliked, &p.LikeCount, &p.DislikeCount)
			if err != nil {
				fmt.Println("Scan error:", err)
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(utils.ResponseApi{
					Success: false,
					Message: "Internal Server Error",
					Error:   "server_error",
				})
				return
			}
			p.Creat_at = utils.GetDuration(Time)
			allpostes = append(allpostes, p)
		}
		if err = potes.Err(); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(utils.ResponseApi{
				Success: false,
				Message: "Internal Server Error",
				Error:   "server_error",
			})
			return
		}

		feed := utils.FeedStruct{}
		feed.AllPosts = append(feed.AllPosts, allpostes...)

		if len(allpostes) == 0 {
			fmt.Println("no feed")
			// Send back an empty list cleanly instead of hanging
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(utils.ResponseApi{Success: true, Data: feed})
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: true,
			Data:    feed,
		})
		return
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "Method Not Allowed",
			Error:   "method_error",
		})
	}
}
