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

// WSMessage is the wire format for every WebSocket frame.
type WSMessage struct {
	Type        string `json:"type"`
	Content     string `json:"content,omitempty"`
	RecipientID int    `json:"recipient_id,omitempty"`
	SenderID    int    `json:"sender_id,omitempty"`
	SenderName  string `json:"sender_name,omitempty"`
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

	Hub_.Register(userID, conn)
	defer Hub_.Unregister(userID, conn)

	// Tell everyone this user is now online
	broadcast <- WSMessage{Type: "user_online", SenderID: userID}

	for {
		var msg WSMessage
		if err := conn.ReadJSON(&msg); err != nil {
			// Connection closed — tell everyone this user is offline (if no sessions left after defer)
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
			// Don't persist — just broadcast presence to all connected users
			Hub_.BroadcastAll(msg)

		case "message":
			_, err := config.Conn.Exec(
				`INSERT INTO direct_messages (sender_id, recipient_id, content, timestamp) VALUES (?, ?, ?, ?)`,
				msg.SenderID, msg.RecipientID, msg.Content, time.Now(),
			)
			if err != nil {
				log.Println("db insert err:", err)
			}
			// Deliver to recipient and echo back to all sender sessions
			Hub_.SendToUser(msg.RecipientID, msg)
			Hub_.SendToUser(msg.SenderID, msg)
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
	if err != nil {
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
