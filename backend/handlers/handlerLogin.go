package handler

import (
	"encoding/json"
	"fmt"
	"net/http"

	"real-time-forum/utils"
)

type User struct {
	Email string `json:email`
	Pass  string `json:pass`
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	utils.EnableCors(w)

	if r.Method == http.MethodOptions {
		fmt.Println("OPTIONS received")
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method == http.MethodPost {
		var user User
		fmt.Println("POST received")

		err := json.NewDecoder(r.Body).Decode(&user)
		if err != nil {
			http.Error(w, "Invalid JSON payload: "+err.Error(), http.StatusBadRequest)
			return
		}
		if user.Email == "" || user.Pass == "" {
			http.Error(w, "The login details not valid", http.StatusBadRequest)
			return
		}
		w.WriteHeader(http.StatusOK)
		return
	}

	http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
}
