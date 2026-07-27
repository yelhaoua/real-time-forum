package handler

import (
	"encoding/json"
	"net/http"

	"real-time-forum/utils"
)

func HnadleCheakSession(w http.ResponseWriter, r *http.Request) {
	user_id, err := utils.CheckSession(w, r)
	if user_id != 0 || err == nil {
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: true,
			Message: "loged in ",
		})
		return
	}

	w.WriteHeader(http.StatusUnauthorized)
	json.NewEncoder(w).Encode(utils.ResponseApi{
		Success: false,
		Message: "pleas login",
	})
}
