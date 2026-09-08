package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"real-time-forum/config"
	"real-time-forum/utils"
)

func HnadleComments(w http.ResponseWriter, r *http.Request) {
	utils.EnableCors(w)

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	userID, err := utils.CheckSession(w, r)
	if err != nil {
		PrintError(w, "auth_error", "Authentication required.", http.StatusUnauthorized)
		return
	}

	if r.Method != http.MethodGet {
		PrintError(w, "method_error", "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	postID := r.PathValue("id")

	type commentData struct {
		Id            int    `json:"id"`
		Content       string `json:"content"`
		CreatedAt     string `json:"created_at"`
		Like_Count    int    `json:"like_count"`
		Dislike_Count int    `json:"dislike_count"`
		IsLiked       bool   `json:"is_liked"`
	}

	var allCommentes []commentData
	query := `
	SELECT
    comments.id,
    comments.content,
    comments.created_at,
    (SELECT COUNT(*) FROM votes  WHERE comment_id = comments.id AND vote_value = 1  ) AS like_Count,
    (SELECT COUNT(*) FROM votes  WHERE comment_id = comments.id AND vote_value =-1 ) AS dislike_Count,
    EXISTS (
        SELECT 1
        FROM votes
        WHERE votes.comment_id = comments.id
          AND votes.user_id = ?
          AND votes.vote_value = 1
    ) AS is_liked
	FROM comments
	WHERE comments.post_id = ?
	ORDER BY comments.created_at DESC

`

	res, err := config.Conn.Query(query, userID, postID)
	if err != nil {
		fmt.Println("err", err)
		PrintError(w, "server_error", "Internal Server Error", http.StatusInternalServerError)
		return
	}
	if res.Err() != nil {
		PrintError(w, "server_error", "Internal Server Error", http.StatusInternalServerError)
		return
	}

	defer res.Close()
	for res.Next() {
		var c commentData
		var create time.Time
		err = res.Scan(&c.Id, &c.Content, &create, &c.Like_Count, &c.Dislike_Count, &c.IsLiked)
		if err != nil {
			fmt.Println("", err)
			PrintError(w, "server_error", "Internal Server Error", http.StatusInternalServerError)
			return
		}
		c.CreatedAt = utils.GetDuration(create)
		allCommentes = append(allCommentes, c)
	}
	if err != nil {
		PrintError(w, "server_error", "Internal Server Error", http.StatusInternalServerError)
		return
	}
	fmt.Println("hnnaaa", allCommentes)

	json.NewEncoder(w).Encode(utils.ResponseApi{
		Success: true,
		Data:    allCommentes,
	})
}
