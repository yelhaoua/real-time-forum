package handler

import (
	"fmt"
	"net/http"

	"real-time-forum/config"
	"real-time-forum/utils"
)

func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	utils.EnableCors(w)
	if r.Method == http.MethodOptions {
		fmt.Println("OPTIONS received")
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method == http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	cookie, err := r.Cookie("Form_Token")
	if err == nil {
		_, _ = config.Conn.Exec(
			"DELETE FROM sessions WHERE token = ?",
			cookie.Value,
		)
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "Form_Token",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
	})

	w.WriteHeader(http.StatusOK)
}
