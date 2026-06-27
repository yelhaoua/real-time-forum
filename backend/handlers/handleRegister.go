package handler

import (
	"fmt"
	"net/http"
)

func HandleRegister(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	fmt.Println("Heloooo")
}
