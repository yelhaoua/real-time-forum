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
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "please log in ",
			Error:   "unauthorized_error",
		})
		return
	}

	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "method not allowed",
			Error:   "method_error",
		})
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
		fmt.Println("err1", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "server error ",
			Error:   "server_error",
		})
		return
	}
	defer res.Close()
	for res.Next() {
		var c commentData
		var create time.Time
		err = res.Scan(&c.Id, &c.Content, &create, &c.Like_Count, &c.Dislike_Count, &c.IsLiked)
		if err != nil {
			fmt.Println("", err)
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(utils.ResponseApi{
				Success: false,
				Message: "server error ",
				Error:   "server_error",
			})
			return
		}
		c.CreatedAt = utils.GetDuration(create)
		fmt.Println("")
		allCommentes = append(allCommentes, c)
	}
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "server error",
			Error:   "server_error",
		})
		return
	}
	fmt.Println("hnnaaa", allCommentes)

	json.NewEncoder(w).Encode(utils.ResponseApi{
		Success: true,
		Data:    allCommentes,
	})
}
