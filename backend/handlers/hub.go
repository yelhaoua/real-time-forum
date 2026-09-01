package handler

import (
	"fmt"
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
	Mu           sync.RWMutex
	Clients      map[int]map[*Client]bool
	Register     chan *Client
	Unregister   chan *Client
	BroadcastAll chan any
}

var Hub_ = NewHub()

func NewHub() *Hub {
	return &Hub{
		Clients:      make(map[int]map[*Client]bool),
		Register:     make(chan *Client),
		Unregister:   make(chan *Client),
		BroadcastAll: make(chan any),
	}
}

func Managehub(hub *Hub) {
	fmt.Println("hna")
	for {
		select {
		case client := <-hub.Register:
			fmt.Println(client)

			hub.Mu.Lock()

			if hub.Clients[client.UserID] == nil {
				hub.Clients[client.UserID] = make(map[*Client]bool)
			}
			hub.Clients[client.UserID][client] = true
			hub.Mu.Unlock()
			fmt.Println("c", hub.Clients)

		case client := <-hub.Unregister:
			hub.Mu.Lock()

			conns, ok := hub.Clients[client.UserID]
			if ok {
				_, ok := conns[client]
				if ok {
					delete(conns, client)
					close(client.Send)
				}
			}
			if len(conns) == 0 {
				delete(hub.Clients, client.UserID)
			}
			hub.Mu.Unlock()

		case message := <-hub.BroadcastAll:
			hub.Mu.Lock()
			for id, conns := range hub.Clients {
				for client := range conns {
					select {
					case client.Send <- message:
					default:
						close(client.Send)
						delete(conns, client)
						client.Conn.Close()
					}
				}
				if len(conns) == 0 {
					delete(hub.Clients, id)
				}
			}
			hub.Mu.Unlock()

		}
	}
}

func WritePump(h *Hub, client *Client) {
	ticker := time.NewTicker(30 * time.Second)
	defer func() {
		ticker.Stop()
		h.Unregister <- client
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
			delete(h.Clients, client.UserID)
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
	h.BroadcastAll <- msg
}
