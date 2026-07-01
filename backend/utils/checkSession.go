package utils

import (
	"net/http"

	"real-time-forum/config"
)

func CheckSession(w http.ResponseWriter, r *http.Request) (int, error) {
	EnableCors(w)
	w.Header().Set("Content-Type", "application/json")
	token, err := r.Cookie("Form_Token")
	if err != nil {
		return 0, err
	}
	query := `SELECT user_id FROM sessions WHERE token = ?`
	userId := 0
	err = config.Conn.QueryRow(query, token.Value).Scan(&userId)
	if err != nil {
		return 0, err
	}

	return userId, nil
}
