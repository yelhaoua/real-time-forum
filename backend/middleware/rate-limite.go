package middleware

import (
	"encoding/json"
	"net/http"
	"sync"
	"time"

	"real-time-forum/utils"
)

type Client struct {
	Requests int
	Time     time.Time
}

var (
	clients = make(map[string]*Client)
	mutex   sync.Mutex
)

func RateLimit(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		utils.EnableCors(w)
		ip := r.RemoteAddr

		mutex.Lock()

		client, exists := clients[ip]

		if !exists {
			clients[ip] = &Client{
				Requests: 1,
				Time:     time.Now(),
			}

			mutex.Unlock()
			next.ServeHTTP(w, r)
			return
		}

		if time.Since(client.Time) >= time.Minute {
			client.Requests = 1
			client.Time = time.Now()

			mutex.Unlock()
			next.ServeHTTP(w, r)
			return
		}

		if client.Requests >= 5 {

			mutex.Unlock()

			w.WriteHeader(http.StatusTooManyRequests)
			json.NewEncoder(w).Encode(utils.ResponseApi{
				Success: false,
				Message: "Too many requests, try again later",
				Error:   "too_many_requests",
			})

			return
		}

		client.Requests++

		mutex.Unlock()

		next.ServeHTTP(w, r)
	})
}
