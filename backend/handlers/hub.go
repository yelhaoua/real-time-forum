package handler

import (
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

const (
	writeWait  = 10 * time.Second
	bufferSize = 256
)

type Client struct {
	UserID int
	Conn   *websocket.Conn
	Send   chan any
}

type Hub struct {
	Mu      sync.RWMutex
	Clients map[int]map[*Client]bool 
}

var Hub_ = NewHub()

func NewHub() *Hub {
	return &Hub{
		Clients: make(map[int]map[*Client]bool),
	}
}

func WritePump(h *Hub, client *Client) {
	ticker := time.NewTicker(30 * time.Second)
	defer func() {
		ticker.Stop()
		Unregister(h, client)
	}()

	for {
		select {
		case message, ok := <-client.Send:
			client.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				client.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			if err := client.Conn.WriteJSON(message); err != nil {
				return
			}
		case <-ticker.C:
			client.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := client.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func Register(h *Hub, userID int, conn *websocket.Conn) *Client {
	client := &Client{
		UserID: userID,
		Conn:   conn,
		Send:   make(chan any, bufferSize),
	}

	h.Mu.Lock()
	if h.Clients[userID] == nil {
		h.Clients[userID] = make(map[*Client]bool)
	}
	h.Clients[userID][client] = true
	h.Mu.Unlock()

	go WritePump(h, client)
	return client
}

func Unregister(h *Hub, client *Client) {
	h.Mu.Lock()
	defer h.Mu.Unlock()

	conns, exists := h.Clients[client.UserID]
	if !exists {
		return
	}

	if _, found := conns[client]; found {
		delete(conns, client)
		close(client.Send)
		client.Conn.Close()
	}

	if len(conns) == 0 {
		delete(h.Clients, client.UserID)
	}
}

func IsOnline(h *Hub, userID int) bool {
	h.Mu.RLock()
	defer h.Mu.RUnlock()
	return len(h.Clients[userID]) > 0
}

func SendToUser(h *Hub, userID int, msg any) {
	h.Mu.RLock()
	defer h.Mu.RUnlock()

	for client := range h.Clients[userID] {
		select {
		case client.Send <- msg:
		default:
			go Unregister(h, client)
		}
	}
}

func Notify(h *Hub, userID int, notifType string, data any) {
	SendToUser(h, userID, map[string]any{
		"type": notifType,
		"data": data,
	})
}

func BroadcastAll(h *Hub, msg any) {
	h.Mu.RLock()
	defer h.Mu.RUnlock()

	for _, conns := range h.Clients {
		for client := range conns {
			select {
			case client.Send <- msg:
			default:
				go Unregister(h, client)
			}
		}
	}
}