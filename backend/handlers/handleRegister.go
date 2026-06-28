package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"strings"

	"real-time-forum/utils"
)

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)

func ValidateEmail(email string) bool {
	email = strings.TrimSpace(email)
	if len(email) < 3 || len(email) > 254 {
		return false
	}
	return emailRegex.MatchString(email)
}

func HandleRegister(w http.ResponseWriter, r *http.Request) {
	utils.EnableCors(w)

	var data struct {
		Name     string
		Email    string
		Password string
	}
	var Errores struct {
		Name     string
		Email    string
		Password string
	}

	json.NewDecoder(r.Body).Decode(&data)
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	hasErr := false
	if len(data.Name) < 3 || len(data.Name) > 30 {
		hasErr = true
		Errores.Name = "please enter valid name"
	}
	if !ValidateEmail(data.Email) {
		hasErr = true
		Errores.Email = "please enter valid email"
	}

	if len(data.Password) < 8 {
		hasErr = true
		Errores.Password = "please enter valid password"
	}

	if hasErr {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Data:    Errores,
			Errore:  "input_error",
		})
		return
	}

	json.NewEncoder(w).Encode(utils.ResponseApi{
		Success: true,
		Message: "you are registerd",
	})

	fmt.Println(data)
}
