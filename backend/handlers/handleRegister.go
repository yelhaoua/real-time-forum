package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"strings"
	"time"

	"real-time-forum/config"
	"real-time-forum/utils"

	"golang.org/x/crypto/bcrypt"
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
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "method not allowed",
		})
		return
	}
	var data struct {
		Name     string
		Email    string
		Password string
	}
	var Errors struct {
		Name     string
		Email    string
		Password string
	}

	json.NewDecoder(r.Body).Decode(&data)

	hasErr := false
	if len(strings.TrimSpace(data.Name)) < 3 || len(strings.TrimSpace(data.Name)) > 30 {
		hasErr = true
		Errors.Name = "please enter valid name"
	}
	if !ValidateEmail(strings.TrimSpace(data.Email)) {
		hasErr = true
		Errors.Email = "please enter valid email"
	}

	if len(data.Password) < 8 {
		hasErr = true
		Errors.Password = "please enter valid password"
	}

	if hasErr {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Data:    Errors,
			Error:   "input_error",
		})
		return
	}
	hashPassword, err := bcrypt.GenerateFromPassword([]byte(data.Password), bcrypt.DefaultCost)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "server error",
			Error:   "server_error",
		})
		return
	}
	fmt.Println(hashPassword)
	_, err = config.Conn.Exec("INSERT INTO users (username, email, password, created_at) VALUES (?, ?, ?, ?)",
		data.Name, data.Email, hashPassword, time.Now())
	if err != nil {
		if strings.Contains(err.Error(), "UNIQUE constraint failed") {
			if strings.Contains(err.Error(), "username") {
				Errors.Name = "duplicated user name"
				w.WriteHeader(http.StatusBadRequest)
				json.NewEncoder(w).Encode(utils.ResponseApi{
					Success: false,
					Data:    Errors,
				})
				return
			}
			if strings.Contains(err.Error(), "email") {
				w.WriteHeader(http.StatusBadRequest)
				Errors.Email = "duplicated user email"
				json.NewEncoder(w).Encode(utils.ResponseApi{
					Success: false,
					Data:    Errors,
				})
				return
			}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(utils.ResponseApi{
				Success: false,
				Message: "data base Error pleas try agin later",
				Error:   "data_base_error",
			})
			return

		} else {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(utils.ResponseApi{
				Success: false,
				Message: "data base Error pleas try agin later",
				Error:   "data_base_error",
			})
			return
		}
	}

	w.WriteHeader(http.StatusOK)

	json.NewEncoder(w).Encode(utils.ResponseApi{
		Success: true,
		Message: "you are registerd",
	})
}
