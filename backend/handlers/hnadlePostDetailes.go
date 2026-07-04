package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"real-time-forum/config"
	"real-time-forum/utils"
)

func HnadlePostDetailes(w http.ResponseWriter, r *http.Request) {
	utils.EnableCors(w)
	fmt.Println(r.URL)

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	userId, err := utils.CheckSession(w, r)
	if err != nil {
		fmt.Println("Error", err)
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "pleas log in",
			Error:   "authorized_error",
		})
		return
	}

	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "Method Not Allowed",
			Error:   "request_error",
		})
		return
	}
	var post struct {
		Postid       int    `json:"post_id"`
		User_id      int    `json:"user_id"`
		User_Name    string `json:"user_name"`
		Title        string `json:"title"`
		Content      string `json:"content"`
		Image_url    string `json:"image_url"`
		Created_at   string `json:"created_at"`
		LikeCount    int    `json:"like_count"`
		DislikeCount int    `json:"dislike_count"`
		Is_liked     int    `json:"is_liked"`
	}
	postID, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "Bad Request",
			Error:   "request_error",
		})
		return
	}

	query := `SELECT * FROM posts WHERE id = ?`
	res := config.Conn.QueryRow(query, postID)
	var timeCreates time.Time
	err = res.Scan(&post.Postid, &post.User_id, &post.Title, &post.Content, &post.Image_url, &timeCreates)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "post not found",
			Error:   "request_error",
		})
		return
	}
	query = `
	SELECT 
    (SELECT count(*) FROM votes WHERE vote_value = ? AND post_id = ? ) AS liked,
    (SELECT count(*) FROM votes WHERE vote_value = ?  AND post_id = ?  ) AS disliked

`
	res = config.Conn.QueryRow(query, 1, postID, -1, postID)
	err = res.Scan(&post.LikeCount, &post.DislikeCount)
	if err != nil {

		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "server error pleas try agin later",
			Error:   "server",
		})
		return
	}
	query = `	
	SELECT EXISTS (
    SELECT 1 
    FROM votes 
    WHERE user_id = ? AND post_id = ?
	) AS has_liked;
 
`
	res = config.Conn.QueryRow(query, userId, postID)
	err = res.Scan(&post.Is_liked)
	if err != nil {
		fmt.Println("err", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "server error pleas try agin later",
			Error:   "server",
		})
		return
	}
	query = `SELECT username FROM users WHERE id = ?`
	res = config.Conn.QueryRow(query, userId)
	err = res.Scan(&post.User_Name)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "server error pleas try agin later",
			Error:   "server",
		})
		return
	}

	post.Created_at = utils.GetDuration(timeCreates)
	fmt.Println(post)
	json.NewEncoder(w).Encode(utils.ResponseApi{
		Success: true,
		Data:    post,
	})
}
