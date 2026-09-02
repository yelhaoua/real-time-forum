package handler

import (
	"database/sql"
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
		Userid       int    `json:"user_id"`
		NickName     string `json:"user_name"`
		Title        string `json:"title"`
		Content      string `json:"content"`
		Imageurl     string `json:"image_url"`
		Createdat    string `json:"created_at"`
		LikeCount    int    `json:"like_count"`
		DislikeCount int    `json:"dislike_count"`
		Isliked      int    `json:"is_liked"`
		IsDisliked   int    `json:"is_disliked"`
		CommentCount int    `json:"comment_count"`
		CategoryName string `json:"category_name"`
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
	err = res.Scan(&post.Postid, &post.Userid, &post.Title, &post.Content, &post.Imageurl, &timeCreates)
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
	SELECT 
  (SELECT EXISTS (
      SELECT 1 
      FROM votes 
      WHERE user_id = ? AND post_id = ? AND vote_value = 1
  )) AS has_liked,
  
  (SELECT EXISTS (
      SELECT 1 
      FROM votes 
      WHERE user_id = ? AND post_id = ? AND vote_value = -1
  )) AS has_disliked 
`
	res = config.Conn.QueryRow(query, userId, postID, userId, postID)
	err = res.Scan(&post.Isliked, &post.IsDisliked)
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
	query = `SELECT nick_name FROM users WHERE id = ?`
	res = config.Conn.QueryRow(query, post.Userid)
	err = res.Scan(&post.NickName)
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

	query = `SELECT COUNT(*) FROM comments WHERE post_id = ?`
	res = config.Conn.QueryRow(query, postID)
	err = res.Scan(&post.CommentCount)
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

	query = `
	SELECT categories.name
	FROM post_categories
	INNER JOIN categories ON categories.id = post_categories.category_id
	WHERE post_categories.post_id = ?
`
	res = config.Conn.QueryRow(query, postID)
	err = res.Scan(&post.CategoryName)
	if err != nil && err != sql.ErrNoRows {
		fmt.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "server error pleas try agin later",
			Error:   "server",
		})
		return
	}

	post.Createdat = utils.GetDuration(timeCreates)
	fmt.Println(post)
	json.NewEncoder(w).Encode(utils.ResponseApi{
		Success: true,
		Data:    post,
	})
}
