package routes

import (
	"net/http"

	handler "real-time-forum/handlers"
)

func Routes() *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("/register", handler.HandleRegister)

	return mux
}
