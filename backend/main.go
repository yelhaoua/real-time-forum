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
	log.Fatal(http.ListenAndServe(":9090", mux))
}
