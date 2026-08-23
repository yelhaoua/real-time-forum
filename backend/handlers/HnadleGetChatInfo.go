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
		Sender_id      int       `json:"sender_id"`
		Recipient_id   int       `json:"recipient_id"`
		Sender_name    string    `json:"sender_name"`
		Recipient_name string    `json:"recipient_name"`
		Content        string    `json:"content"`
		Creat_time     time.Time `json:"creat_time"`
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
	fmt.Println(userID, ChatID)
	if userID == numChatID {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "invalid chat id",
			Error:   "chat-error",
		})
		return
	}

	limitStr := r.URL.Query().Get("limit")
	offsetStr := r.URL.Query().Get("offset")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 10
	}
	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	query := `
	SELECT
	dm.sender_id,
    sender.nick_name AS sender_name,
	dm.recipient_id,
    recipient.nick_name AS recipient_name,
    dm.content,
    dm.timestamp
	FROM direct_messages dm
	JOIN users sender
		ON sender.id = dm.sender_id
	JOIN users recipient
		ON recipient.id = dm.recipient_id
	WHERE
		(dm.sender_id = ? AND dm.recipient_id = ?)
		OR
		(dm.sender_id = ? AND dm.recipient_id = ?)
	ORDER BY dm.timestamp DESC
	LIMIT ? OFFSET ?;
	`

	res, err := config.Conn.Query(query, userID, ChatID, ChatID, userID, limit, offset)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "InternalServerError",
			Error:   "server-error",
		})
		return
	}

	if res.Err() != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "InternalServerError",
			Error:   "server-error",
		})
		return
	}

	defer res.Close()
	var allMessages []chatInfo

	for res.Next() {
		var message chatInfo
		err = res.Scan(&message.Sender_id, &message.Sender_name, &message.Recipient_id, &message.Recipient_name, &message.Content, &message.Creat_time)
		if err != nil {
			fmt.Println("err", err)
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(utils.ResponseApi{
				Success: false,
				Message: "InternalServerError scan err",
				Error:   "server-error",
			})
			return
		}
		allMessages = append(allMessages, message)
	}

	// reverse so messages are chronological (ASC) for the frontend
	for i, j := 0, len(allMessages)-1; i < j; i, j = i+1, j-1 {
		allMessages[i], allMessages[j] = allMessages[j], allMessages[i]
	}

	var resc_user_name string
	query = `SELECT nick_name from users  WHERE id = ?`
	err = config.Conn.QueryRow(query, ChatID).Scan(&resc_user_name)
	if err != nil {
		fmt.Println("err", err)
	}
	var finleres struct {
		AllMessages    []chatInfo
		Resc_user_name string
	}
	finleres.AllMessages = allMessages
	finleres.Resc_user_name = resc_user_name

	json.NewEncoder(w).Encode(utils.ResponseApi{
		Success: true,
		Data:    finleres,
	})
}
