package handler

import (
	"encoding/json"
	"fmt"
	"net/http"

	"real-time-forum/config"
	"real-time-forum/utils"
)

func HnadleGetUser(w http.ResponseWriter, r *http.Request) {
	utils.EnableCors(w)

	w.Header().Set("Content-Type", "application/json")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "method not allowed",
			Error:   "method_error",
		})
		return
	}

	var data string

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "error in json body",
			Error:   "request_error",
		})
		return
	}

	query := `SELECT username FROM users WHERE username LIKE ?`

	rows, err := config.Conn.Query(query, "%"+data+"%")
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "database query error",
			Error:   err.Error(),
		})
		return
	}

	defer rows.Close()

	var users []string

	for rows.Next() {
		var username string
		err := rows.Scan(&username)
		if err != nil {
			fmt.Println(username, err)
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(utils.ResponseApi{
				Success: false,
				Message: "error scanning users",
				Error:   err.Error(),
			})
			return
		}

		users = append(users, username)
	}

	if err := rows.Err(); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "error reading users",
			Error:   err.Error(),
		})
		return
	}
	fmt.Println(users)
	json.NewEncoder(w).Encode(utils.ResponseApi{
		Success: true,
		Data:    users,
	})
}
