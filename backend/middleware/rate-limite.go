package middleware

import (
	"encoding/json"
	"net"
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

// requests allowed per minute for each route
var routeLimits = map[string]int{
	"/register":   10,
	"/login":      10,
	"/craet-post": 10,
}

func RateLimit(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Let preflight through — it carries no payload and must not be counted
		if r.Method == http.MethodOptions {
			next.ServeHTTP(w, r)
			return
		}

		host, _, _ := net.SplitHostPort(r.RemoteAddr)

		key := host + ":" + r.URL.Path

		limit := routeLimits[r.URL.Path]
		if limit == 0 {
			limit = 10
		}

		mutex.Lock()

		client, exists := clients[key]

		if !exists {
			clients[key] = &Client{
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

		if client.Requests >= limit {
			mutex.Unlock()

			utils.EnableCors(w)
			w.WriteHeader(http.StatusTooManyRequests)

			json.NewEncoder(w).Encode(utils.ResponseApi{
				Success: false,
				Message: "Too many requests, try again later.",
				Error:   "too_many_requests",
			})
			return
		}

		client.Requests++

		mutex.Unlock()

		next.ServeHTTP(w, r)
	})
}
