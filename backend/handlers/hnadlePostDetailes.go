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
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "pleas log in",
			Errore:  "authorized_error",
		})
		return
	}

	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "Method Not Allowed",
			Errore:  "request_error",
		})
		return
	}
	var post struct {
		Postid       int
		User_id      int
		Title        string
		Content      string
		Image_url    string
		Created_at   time.Time
		LikeCount    int
		DislikeCount int
		Is_liked     int
	}
	postID, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "Bad Request",
			Errore:  "request_error",
		})
		return
	}

	query := `SELECT * FROM posts WHERE id = ?`
	res := config.Conn.QueryRow(query, postID)
	err = res.Scan(&post.Postid, &post.User_id, &post.Title, &post.Content, &post.Image_url, &post.Created_at)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "post not found",
			Errore:  "request_error",
		})
		return
	}
	query = `
	SELECT 
    (SELECT count(*) FROM votes WHERE user_id = 1 AND vote_value =1 ) AS liked,
    (SELECT count(*) FROM votes WHERE user_id = 1 AND vote_value = -1 ) AS disliked
`
	res = config.Conn.QueryRow(query, postID, 1)
	err = res.Scan(&post.LikeCount, &post.DislikeCount)
	if err != nil {

		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "server error pleas try agin later",
			Errore:  "server",
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
			Errore:  "server",
		})
		return
	}
	fmt.Println(post)
}
