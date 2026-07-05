package handler

import (
	"encoding/json"
	"net/http"

	"real-time-forum/config"
	"real-time-forum/utils"
)

func HnadleGetInfo(w http.ResponseWriter, r *http.Request) {
	utils.EnableCors(w)

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	userID, err := utils.CheckSession(w, r)
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(&utils.ResponseApi{
			Success: false,
			Message: "pleas log in",
			Error:   "unauthorized_error",
		})
		return
	}
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(&utils.ResponseApi{
			Success: false,
			Message: "method not allowed",
			Error:   "method_error",
		})
		return
	}
	var user_name string

	query := `SELECT users.username FROM users WHERE id = ?`

	err = config.Conn.QueryRow(query, userID).Scan(&user_name)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(&utils.ResponseApi{
			Success: false,
			Message: "internal server error",
			Error:   "server_error",
		})
		return
	}

	json.NewEncoder(w).Encode(&utils.ResponseApi{
		Success: true,
		Data:    user_name,
	})
}
