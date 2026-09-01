package handler

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"real-time-forum/config"
	"real-time-forum/utils"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

type WSMessage struct {
	Type        string `json:"type"`
	Content     string `json:"content,omitempty"`
	RecipientID int    `json:"recipient_id,omitempty"`
	SenderID    int    `json:"sender_id,omitempty"`
	SenderName  string `json:"sender_name,omitempty"`
	CreatTime   string `json:"creat_time,omitempty"`
	TempID      string `json:"temp_id,omitempty"`
}

var broadcast = make(chan WSMessage, 256)

func HandleSendMessage(w http.ResponseWriter, r *http.Request) {
	utils.EnableCors(w)

	userID, err := utils.CheckSession(w, r)
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(utils.ResponseApi{Success: false, Message: "unauthorized", Error: "unauthorized_error"})
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("upgrade err:", err)
		return
	}
	client := &Client{
		UserID: userID,
		Conn:   conn,
		Send:   make(chan any, bufferSize),
	}
	Hub_.Register <- client
	go WritePump(Hub_, client)

	broadcast <- WSMessage{Type: "user_online", SenderID: userID}

	for {
		var msg WSMessage
		if err := conn.ReadJSON(&msg); err != nil {
			broadcast <- WSMessage{Type: "user_offline", SenderID: userID}
			return
		}
		msg.Type = "message"
		msg.SenderID = userID
		broadcast <- msg
	}
}

func HandleMessages() {
	for msg := range broadcast {
		switch msg.Type {
		case "user_online", "user_offline":
			BroadcastAll(Hub_, msg)

		case "message":
			var senderName string
			if err := config.Conn.QueryRow("SELECT nick_name FROM users WHERE id = ?", msg.SenderID).Scan(&senderName); err != nil {
				log.Println("sender lookup err:", err)
			} else {
				msg.SenderName = senderName
			}

			msg.CreatTime = time.Now().Format(time.RFC3339Nano)

			_, err := config.Conn.Exec(
				`INSERT INTO direct_messages (sender_id, recipient_id, content, timestamp) VALUES (?, ?, ?, ?)`,
				msg.SenderID, msg.RecipientID, msg.Content, msg.CreatTime,
			)
			if err != nil {
				log.Println("db insert err:", err)
			}

			_, err = config.Conn.Exec(
				`INSERT INTO notifications (user_id, sender_id, type, snippet, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
				msg.RecipientID, msg.SenderID, "new_message", msg.Content, 0, time.Now(),
			)
			if err != nil {
				log.Println("notification insert err:", err)
			}

			_, _ = config.Conn.Exec(`DELETE FROM notifications WHERE user_id = ? AND sender_id = ? AND is_read = 0`, msg.SenderID, msg.RecipientID)
			SendToUser(Hub_, msg.RecipientID, msg)
			SendToUser(Hub_, msg.SenderID, msg)

			notifData := map[string]any{
				"sender_id":   msg.SenderID,
				"sender_name": msg.SenderName,
				"snippet":     msg.Content,
				"timestamp":   msg.CreatTime,
			}

			Notify(Hub_, msg.RecipientID, "new_message", notifData)

			Notify(Hub_, msg.SenderID, "message_sent", notifData)
		}
	}
}

func GetMessages(w http.ResponseWriter, r *http.Request) {
	utils.EnableCors(w)
	userID, err := utils.CheckSession(w, r)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(utils.ResponseApi{Success: false, Message: "bad request", Error: "request_error"})
		return
	}
	rows, err := config.Conn.Query(
		`SELECT sender_id, recipient_id, content, timestamp FROM direct_messages WHERE recipient_id = ? OR sender_id = ? ORDER BY timestamp ASC`,
		userID, userID,
	)
	if err != nil || rows.Err() != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(utils.ResponseApi{Success: false, Message: "db error", Error: "db_error"})
		return
	}
	defer rows.Close()

	var msgs []utils.Message
	for rows.Next() {
		var m utils.Message
		if err := rows.Scan(&m.SenderID, &m.RecipientID, &m.Content, &m.Timestamp); err != nil {
			continue
		}
		msgs = append(msgs, m)
	}
	json.NewEncoder(w).Encode(utils.ResponseApi{Success: true, Data: msgs})
}
