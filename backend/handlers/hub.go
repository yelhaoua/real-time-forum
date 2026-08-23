package handler

import (
	"sync"

	"github.com/gorilla/websocket"
)

// Hub manages all active WebSocket connections.
// Each user can have multiple simultaneous sessions (tabs/devices).
type Hub struct {
	mu      sync.RWMutex
	clients map[int]map[*websocket.Conn]bool // userID → set of conns
}

var Hub_ = &Hub{
	clients: make(map[int]map[*websocket.Conn]bool),
}

// Register adds a connection for a user.
func (h *Hub) Register(userID int, conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if h.clients[userID] == nil {
		h.clients[userID] = make(map[*websocket.Conn]bool)
	}
	h.clients[userID][conn] = true
}

// Unregister removes a specific connection. Deletes the user entry when last session closes.
func (h *Hub) Unregister(userID int, conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	conns := h.clients[userID]
	if conns == nil {
		return
	}
	delete(conns, conn)
	conn.Close()
	if len(conns) == 0 {
		delete(h.clients, userID)
	}
}

// IsOnline reports whether a user has at least one active connection.
func (h *Hub) IsOnline(userID int) bool {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients[userID]) > 0
}

// SendToUser delivers msg to every active session of a single user.
func (h *Hub) SendToUser(userID int, msg any) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.writeToUser(userID, msg)
}

// Notify sends a typed notification envelope to a single user.
//
//	hub.Notify(userID, "new_message", payload)
//	hub.Notify(userID, "user_online",  map[string]any{"user_id": id})
func (h *Hub) Notify(userID int, notifType string, data any) {
	h.SendToUser(userID, map[string]any{
		"type": notifType,
		"data": data,
	})
}

// BroadcastAll delivers msg to every connected user (e.g. online/offline events).
func (h *Hub) BroadcastAll(msg any) {
	h.mu.Lock()
	defer h.mu.Unlock()
	for userID := range h.clients {
		h.writeToUser(userID, msg)
	}
}

// writeToUser must be called with h.mu held.
func (h *Hub) writeToUser(userID int, msg any) {
	conns := h.clients[userID]
	for conn := range conns {
		if err := conn.WriteJSON(msg); err != nil {
			conn.Close()
			delete(conns, conn)
		}
	}
	if len(conns) == 0 {
		delete(h.clients, userID)
	}
}
