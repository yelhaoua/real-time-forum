package main

import (
	"log"
	"net/http"

	"real-time-forum/routes"
)

func main() {
	mux := routes.Routes()

	log.Fatal(http.ListenAndServe(":9090", mux))
}
