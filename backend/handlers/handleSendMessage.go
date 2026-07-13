package handler

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"real-time-forum/config"
	"real-time-forum/utils"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type Messages struct {
	Content      string `json:"content"`
	Recipient_id int    `json:"recipient_id"`
	Sender_id    int    `json:"sender_id"`
}

var (
	Clients   = make(map[int]*websocket.Conn)
	broadcast = make(chan Messages)
	Mu        sync.Mutex
)

func HandleSendMessage(w http.ResponseWriter, r *http.Request) {
	utils.EnableCors(w)
	userId, err := utils.CheckSession(w, r)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "bad request",
			Error:   "request_error",
		})
		return
	}
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("err web", err)
		return
	}

	defer conn.Close()
	Mu.Lock()
	Clients[userId] = conn
	Mu.Unlock()

	broadcast <- Messages{
        Content:      "SYSTEM_USER_ONLINE",
        Sender_id:    userId,
        Recipient_id: 0,
    }
	fmt.Println("conn ,", conn)

	for {
		var messages Messages

		err := conn.ReadJSON(&messages)
		if err != nil {
			fmt.Println("err in for ,", err)
			Mu.Lock()
			delete(Clients, userId)
			Mu.Unlock()
			broadcast <- Messages{
                Content:      "SYSTEM_USER_OFFLINE",
                Sender_id:    userId,
                Recipient_id: 0,
            }
			return
		}
		messages.Sender_id = userId
		broadcast <- messages

	}
}

func GetMessages(w http.ResponseWriter, r *http.Request) {
	utils.EnableCors(w)
	userId, err := utils.CheckSession(w, r)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(utils.ResponseApi{Success: false, Message: "bad request", Error: "request_error"})
		return
	}
	rows, err := config.Conn.Query("SELECT sender_id, recipient_id, content, timestamp FROM direct_messages WHERE recipient_id = ? OR sender_id = ? ORDER BY timestamp ASC", userId, userId)
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

func HandleMessages() {
	for {
		msg := <-broadcast

		query := `INSERT INTO direct_messages (sender_id, recipient_id, content ,timestamp) VALUES (?, ?, ? ,?)`
		_, err := config.Conn.Exec(query, msg.Sender_id, msg.Recipient_id, msg.Content, time.Now())
		if err != nil {
			log.Println("insert", err)
		}
		fmt.Println("inserted data")
		Mu.Lock()
		if receiverSocket, online := Clients[msg.Recipient_id]; online {
			err := receiverSocket.WriteJSON(msg)
			if err != nil {
				log.Printf("rec err", msg.Recipient_id, err)
				receiverSocket.Close()
				delete(Clients, msg.Recipient_id)
			}
		}
		if senderSocket, online := Clients[msg.Sender_id]; online {
			senderSocket.WriteJSON(msg)
		}
		Mu.Unlock()
	}
}
