package utils

import (
	"encoding/json"
	"fmt"
	"net/http"

	"real-time-forum/config"
)

func CheckSession(w http.ResponseWriter, r *http.Request) (int, error) {
	EnableCors(w)
	token, err := r.Cookie("Form_Token")
	for _, c := range r.Cookies() {
		fmt.Printf("%s = %s\n", c.Name, c.Value)
	}
	if err != nil {
		fmt.Println("err1", err)
		json.NewEncoder(w).Encode(ResponseApi{
			Success: false,
			Message: "pleas log in",
			Errore:  "auth_err",
		})
		return 0, err
	}
	query := `SELECT user_id FROM sessions WHERE token = ?`
	userId := 0
	err = config.Conn.QueryRow(query, token.Value).Scan(&userId)
	if err != nil {
		fmt.Println("err2")
		json.NewEncoder(w).Encode(ResponseApi{
			Success: false,
			Message: "pleas log in",
			Errore:  "auth_err",
		})
		return 0, err
	}

	return userId, nil
}
