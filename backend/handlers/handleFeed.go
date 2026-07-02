package handler

import (
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

	userID, err := utils.CheckSession(w, r)
	if err != nil {
		JsonEncoder(w, "Authentication required.", http.StatusUnauthorized)
		return
	}

	if r.Method == http.MethodPost {
		err := json.NewDecoder(r.Body).Decode(&action)
		if err != nil {
			JsonEncoder(w, err.Error(), http.StatusBadRequest)
			return
		}
		if action.Actions == "like" {
			result, err := config.Conn.Exec(
				"UPDATE votes SET vote_value = 1 WHERE post_id = ? AND user_id = ?",
				action.ID,
				userID,
			)
			if err != nil {
				JsonEncoder(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}

			rows, _ := result.RowsAffected()
			if rows == 0 {
				_, err = config.Conn.Exec(
					"INSERT INTO votes(post_id, user_id, vote_value) VALUES(?, ?, 1)",
					action.ID,
					userID,
				)
				if err != nil {
					JsonEncoder(w, "Internal Server Error", http.StatusInternalServerError)
					return
				}
			}
		}
		JsonEncoder(w, "liked", http.StatusAccepted)
		return
	}

	if r.Method == http.MethodGet {

		query := `SELECT
			posts.id,
			posts.title,
			posts.content,
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
			INNER JOIN users
			ON posts.user_id = users.id
			ORDER BY posts.created_at DESC
					 `
		potes, err := config.Conn.Query(query, userID, userID)
		if err != nil {
			JsonEncoder(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		defer potes.Close()
		var allpostes []utils.Posts

		for potes.Next() {
			var p utils.Posts
			var Time time.Time
			err := potes.Scan(&p.Id, &p.Title, &p.Content, &Time, &p.UserName, &p.Isliked, &p.IsDisliked, &p.LikeCount, &p.DislikeCount)
			if err != nil {
				fmt.Println("Scan error:", err)
				JsonEncoder(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}
			p.Creat_at = utils.GetDuration(Time)
			allpostes = append(allpostes, p)
		}
		if err = potes.Err(); err != nil {
			JsonEncoder(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		feed := utils.FeedStruct{}
		feed.AllPosts = append(feed.AllPosts, allpostes...)

		if len(allpostes) == 0 {
			fmt.Println("no feed")
			return
		}

		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: true,
			Data:    feed,
		})
		return
	}
	JsonEncoder(w, "Method Not Allowed", http.StatusMethodNotAllowed)
}
