package main

import (
	"log"
	"net/http"
<<<<<<< HEAD
	"real-time-forum/handlers"
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/login", handler.LoginHandler)
	http.ListenAndServe(":9090", mux)
=======

	"real-time-forum/routes"
)

func main() {
	mux := routes.Routes()

	log.Fatal(http.ListenAndServe(":9090", mux))
>>>>>>> main
}
