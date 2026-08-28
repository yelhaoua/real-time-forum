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

		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "pleas log in",
			Error:   "unauthorized_error",
		})

		return
	}

	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "method not allowed",
			Error:   "method_error",
		})
		return
	}

	var data struct {
		Newcomment string `json:"newcomment"`
	}

	json.NewDecoder(r.Body).Decode(&data)

	postId := r.PathValue("postId")

	if len(data.Newcomment) > 100 || len(data.Newcomment) < 3 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(&utils.ResponseApi{
			Success: false,
			Message: "invalid comment length",
			Error:   "input_error",
		})
		return
	}

	query := `
	INSERT INTO comments
	("post_id"  ,"user_id" ,"content" ,created_at) 
	VALUES (? ,? ,? ,?)
`

	_, err = config.Conn.Exec(query, postId, userID, data.Newcomment, time.Now())
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(&utils.ResponseApi{
			Success: false,
			Message: "internal server error",
			Error:   "server_error",
		})
		return
	}

	json.NewEncoder(w).Encode(&utils.ResponseApi{
		Success: true,
		Message: "commente send.",
	})
}
