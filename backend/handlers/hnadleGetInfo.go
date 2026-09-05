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
		PrintError(w, "auth_error", "Authentication required.", http.StatusUnauthorized)
		return
	}
	if r.Method != http.MethodGet {
		PrintError(w, "method_error", "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	var user_name string

	query := `SELECT users.nick_name FROM users WHERE id = ?`

	err = config.Conn.QueryRow(query, userID).Scan(&user_name)
	if err != nil {
		PrintError(w, "server_error", "Internal Server Error", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(&utils.ResponseApi{
		Success: true,
		Data:    user_name,
	})
}