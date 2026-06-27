package routes

import (
	"net/http"

	handler "real-time-forum/handlers"
)

func Routes() {
	mux := http.NewServeMux()

	mux.HandleFunc("/register", handler.HandleRegister)
}
