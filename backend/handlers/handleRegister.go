package handler

import (
	"fmt"
	"net/http"

	"real-time-forum/utils"
)

func HandleRegister(w http.ResponseWriter, r *http.Request) {
	
	fmt.Println("Heloooo")
	utils.EnableCors(w)
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

}
