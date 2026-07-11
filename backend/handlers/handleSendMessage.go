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
	clients   = make(map[int]*websocket.Conn)
	broadcast = make(chan Messages)
	mu        sync.Mutex
)

func HnadleSendMessage(w http.ResponseWriter, r *http.Request) {
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
	mu.Lock()
	clients[userId] = conn
	mu.Unlock()
	fmt.Println("conn ,", conn)

	for {
		var messages Messages

		err := conn.ReadJSON(&messages)
		if err != nil {
			fmt.Println("err in for ,", err)
			mu.Lock()
			delete(clients, userId)
			mu.Unlock()
			return
		}
		messages.Sender_id = userId
		broadcast <- messages

	}
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
		mu.Lock()
		if receiverSocket, online := clients[msg.Recipient_id]; online {
			err := receiverSocket.WriteJSON(msg)
			if err != nil {
				log.Printf("rec err", msg.Recipient_id, err)
				receiverSocket.Close()
				delete(clients, msg.Recipient_id)
			}
		}
		if senderSocket, online := clients[msg.Sender_id]; online {
			senderSocket.WriteJSON(msg)
		}
		mu.Unlock()
	}
}
