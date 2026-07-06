package main

import (
	"log"
	"net/http"

	"real-time-forum/config"
	"real-time-forum/routes"
)

func main() {
	mux := routes.Routes()
	config.DbConnect()

	fs := http.FileServer(http.Dir("./uploads"))

	mux.Handle("/uploads/",
		http.StripPrefix("/uploads/", fs),
	)
	log.Fatal(http.ListenAndServe(":9090", mux))
}
