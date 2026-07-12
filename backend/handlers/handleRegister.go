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

type Registerdata struct {
	NickName  string `json:"Nickname"`
	FristName string `json:"first-name"`
	LastName  string `json:"last-name"`
	Email     string `json:"email"`
	Password  string `json:"password"`
}

type RegisterErrors struct {
	NickName  string `json:"nickname"`
	FristName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
	Password  string `json:"password"`
}

func ValidateEmail(email string) bool {
	email = strings.TrimSpace(email)
	if len(email) < 3 || len(email) > 254 {
		return false
	}
	return emailRegex.MatchString(email)
}

func CheckName(names string) bool {
	if len(strings.TrimSpace(names)) < 3 || len(strings.TrimSpace(names)) > 10 {
		return true
	}
	return false
}

func Validatore(data Registerdata, Errors *RegisterErrors) bool {
	hasErr := false
	fmt.Println("data", data.NickName, CheckName(data.NickName))
	if CheckName(data.NickName) {
		hasErr = true
		Errors.NickName = "please enter valid nickname"
	}
	fmt.Println("data", data.FristName, CheckName(data.FristName))
	if CheckName(data.FristName) {
		hasErr = true
		Errors.FristName = "please enter valid frist name"
	}
	fmt.Println("data", data.LastName, CheckName(data.LastName))
	if CheckName(data.LastName) {
		hasErr = true
		Errors.LastName = "please enter valid last name"
	}
	if !ValidateEmail(strings.TrimSpace(data.Email)) {
		hasErr = true
		Errors.Email = "please enter valid email"
	}
	if len(data.Password) < 8 {
		hasErr = true
		Errors.Password = "please enter valid password"
	}
	return hasErr
}

func HandleRegister(w http.ResponseWriter, r *http.Request) {
	utils.EnableCors(w)
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	_, err := utils.CheckSession(w, r)
	if err == nil {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "login",
		})
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

	var data Registerdata
	var Errors RegisterErrors

	err = json.NewDecoder(r.Body).Decode(&data)
	fmt.Println("data alll", data)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "invalid json body",
			Error:   "input_error",
		})
		return
	}

	if Validatore(data, &Errors) {
		fmt.Println(data, Errors, "hh111111")
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
	_, err = config.Conn.Exec("INSERT INTO users (nick_name ,frist_name, last_name ,email, password, created_at) VALUES (?, ?, ?, ? ,?, ?)",
		data.NickName, data.FristName, data.LastName, data.Email, hashPassword, time.Now())
	fmt.Println("err", err)
	if err != nil {
		if strings.Contains(err.Error(), "UNIQUE constraint failed") {
			if strings.Contains(err.Error(), "users.email") || strings.Contains(err.Error(), "users.nick_name") {
				Errors.NickName = "duplicated user nick_name or user email"
				w.WriteHeader(http.StatusBadRequest)
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

		}
		Errors.Email = "duplicated user email or user name"
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Data:    Errors,
		})
		return
	}

	w.WriteHeader(http.StatusOK)

	json.NewEncoder(w).Encode(utils.ResponseApi{
		Success: true,
		Message: "you are registerd",
	})
}
