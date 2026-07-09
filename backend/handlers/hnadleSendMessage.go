package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"real-time-forum/config"
	"real-time-forum/utils"
)

func HnadleSendMessage(w http.ResponseWriter, r *http.Request) {
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
		Content string `json:"message-content"`
	}
	err = json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "invalid json body",
			Error:   "request_error",
		})
		return
	}
	ChatID := r.PathValue("id")

	query := `INSERT INTO direct_messages
	( "sender_id"  ,"recipient_id" ,"content" ,"timestamp")
	VALUES (?,?,?,?)`
	_, err = config.Conn.Query(query, userID, ChatID, data.Content, time.Now())
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "internal server error",
			Error:   "server_error",
		})
		return
	}

	json.NewEncoder(w).Encode(utils.ResponseApi{
		Success: true,
		Message: "message send",
	})
}
