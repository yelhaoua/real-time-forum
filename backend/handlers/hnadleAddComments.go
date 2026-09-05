package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"real-time-forum/config"
	"real-time-forum/utils"
)

func HnadleAddComments(w http.ResponseWriter, r *http.Request) {
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

	if r.Method != http.MethodPost {
		PrintError(w, "method_error", "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	var data struct {
		Newcomment string `json:"newcomment"`
	}

	json.NewDecoder(r.Body).Decode(&data)

	postId := r.PathValue("postId")

	if len(data.Newcomment) > 100 || len(data.Newcomment) < 3 {
		PrintError(w, "input_error", "Comment must be between 3 and 100 characters.", http.StatusBadRequest)
		return
	}

	query := `
	INSERT INTO comments
	("post_id"  ,"user_id" ,"content" ,created_at) 
	VALUES (? ,? ,? ,?)
`

	_, err = config.Conn.Exec(query, postId, userID, data.Newcomment, time.Now())
	if err != nil {
		PrintError(w, "server_error", "Internal Server Error", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(&utils.ResponseApi{
		Success: true,
		Message: "commente send.",
	})
}
