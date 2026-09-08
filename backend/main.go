package main

import (
	"log"
	"net/http"

	"real-time-forum/config"
	handler "real-time-forum/handlers"
	"real-time-forum/routes"
)

func main() {
	mux := routes.Routes()
	config.DbConnect()
	hub := handler.NewHub()
	handler.Hub_ = hub
	go handler.Managehub(hub)
	go handler.HandleMessages()

	fs := http.FileServer(http.Dir("./uploads"))

	mux.Handle(
		"/uploads/",
		http.StripPrefix("/uploads/", fs),
	)
	log.Println("App started : http://localhost:9090")
	log.Fatal(http.ListenAndServe(":9090", mux))
}
