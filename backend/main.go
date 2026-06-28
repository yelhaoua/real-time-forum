package main

import (
	"net/http"
	"real-time-forum/handlers"
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/login", handler.LoginHandler)
	http.ListenAndServe(":9090", mux)
}
