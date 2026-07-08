package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"real-time-forum/utils"
)

func HnadleGetChatInfo(w http.ResponseWriter, r *http.Request) {
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

	ChatID := r.PathValue("id")

	type chatInfo struct {
		Sender     string `json:"sender"`
		Reciver    string `json:"reciver"`
		Content    string `json:"content"`
		Creat_time int    `json:"creat_time"`
	}

	numChatID, err := strconv.Atoi(ChatID)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "invalid chat id",
			Error:   "chat-error",
		})
		return
	}
	if userID == numChatID {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "invalid chat id",
			Error:   "chat-error",
		})
		return
	}


	
}
