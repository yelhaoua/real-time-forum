package handler

import (
	"net/http"

	"real-time-forum/utils"
)

func HnadleCheakSession(w http.ResponseWriter, r *http.Request) {
	utils.EnableCors(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	user_id, err := utils.CheckSession(w, r)
	if user_id != 0 || err == nil {
		PrintError(w, "", "session is valid", http.StatusOK)
		return
	}

	PrintError(w, "auth_error", "session is invalid please login", http.StatusUnauthorized)
}
