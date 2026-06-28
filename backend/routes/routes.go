package routes

import (
	"net/http"

	handler "real-time-forum/handlers"
)

func Routes() *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("/", handler.HandleRoot)
	mux.HandleFunc("/register", handler.HandleRegister)
	mux.HandleFunc("/login", handler.LoginHandler)

	return mux
}
