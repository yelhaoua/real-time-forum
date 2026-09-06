package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"real-time-forum/config"
	"real-time-forum/utils"

	"golang.org/x/crypto/bcrypt"
)

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)

type RegisterData struct {
	Nickname  string `json:"nickname"`
	FirstName string `json:"first-name"`
	LastName  string `json:"last-name"`
	Email     string `json:"email"`
	Age       string `json:"user-age"`
	BirthDate string `json:"user-birthdate"`
	Gender    string `json:"user-gender"`
	Password  string `json:"password"`
}

type RegisterErrors struct {
	Nickname  string `json:"nickname,omitempty"`
	FirstName string `json:"first_name,omitempty"`
	LastName  string `json:"last_name,omitempty"`
	Email     string `json:"email,omitempty"`
	Password  string `json:"password,omitempty"`
	Age       string `json:"age,omitempty"`
	BirthDate string `json:"birthdate,omitempty"`
	Gender    string `json:"gender,omitempty"`
}

func ValidateEmail(email string) bool {
	email = strings.TrimSpace(email)
	if len(email) < 3 || len(email) > 254 {
		return false
	}
	return emailRegex.MatchString(email)
}

func IsValidName(name string) bool {
	trimmed := strings.TrimSpace(name)
	return len(trimmed) >= 2 && len(trimmed) <= 50 && !strings.ContainsRune(name, '\x00')
}

func ValidUsername(username string) bool {
	return regexp.MustCompile(`^[a-zA-Z0-9_]{3,20}$`).MatchString(username)
}

func ValidateRegistration(data *RegisterData) (RegisterErrors, bool) {
	var errs RegisterErrors
	hasErr := false

	data.Nickname = strings.TrimSpace(data.Nickname)
	data.FirstName = strings.TrimSpace(data.FirstName)
	data.LastName = strings.TrimSpace(data.LastName)
	data.Email = strings.ToLower(strings.TrimSpace(data.Email))
	data.BirthDate = strings.TrimSpace(data.BirthDate)
	data.Gender = strings.TrimSpace(data.Gender)

	if !IsValidName(data.Nickname) {
		hasErr = true
		errs.Nickname = "Nickname must be between 2 and 50 characters"
	}
	
	if !ValidUsername(data.Nickname) {
		hasErr = true
		errs.Nickname = "Nickname can only contain letters, numbers, and underscores, and must be between 3 and 20 characters"
	}

	if !IsValidName(data.FirstName) {
		hasErr = true
		errs.FirstName = "First name must be between 2 and 50 characters"
	}

	if !IsValidName(data.LastName) {
		hasErr = true
		errs.LastName = "Last name must be between 2 and 50 characters"
	}

	if !ValidateEmail(data.Email) {
		hasErr = true
		errs.Email = "Please enter a valid email address"
	}

	if len(data.Password) < 8 {
		hasErr = true
		errs.Password = "Password must be at least 8 characters long"
	}

	age, err := strconv.Atoi(data.Age)
	if err != nil || age < 18 {
		hasErr = true
		errs.Age = "You must be at least 18 years old"
	}

	if data.Gender == "" {
		hasErr = true
		errs.Gender = "Please select a gender"
	}

	return errs, hasErr
}

func HandleRegister(w http.ResponseWriter, r *http.Request) {
	utils.EnableCors(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		PrintError(w, "method_error", "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	_, err := utils.CheckSession(w, r)
	if err == nil {
		PrintError(w, "auth_error", "You are already logged in", http.StatusBadRequest)
		return
	}

	var data RegisterData
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		fmt.Println("err", err)
		PrintError(w, "request_error", "Invalid JSON", http.StatusBadRequest)
		return
	}

	validationErrs, hasErr := ValidateRegistration(&data)
	if hasErr {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Data:    validationErrs,
			Error:   "input_error",
		})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(data.Password), bcrypt.DefaultCost)
	if err != nil {
		PrintError(w, "server_error", "Internal Server Error", http.StatusInternalServerError)
		return
	}

	query := `INSERT INTO users (nick_name, frist_name, last_name, email, age, gender, password, created_at) 
	          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`

	lastInsert, err := config.Conn.Exec(
		query,
		data.Nickname, data.FirstName, data.LastName, data.Email,
		data.Age, data.Gender, string(hashedPassword), time.Now(),
	)
	if err != nil {
		fmt.Println("err", err)
		if strings.Contains(err.Error(), "UNIQUE constraint failed") {
			var errs RegisterErrors
			if strings.Contains(err.Error(), "users.email") {
				errs.Email = "Email is already in use"
			}
			if strings.Contains(err.Error(), "users.nick_name") {
				errs.Nickname = "Nickname is already taken"
			}

			w.WriteHeader(http.StatusConflict)
			json.NewEncoder(w).Encode(utils.ResponseApi{
				Success: false,
				Data:    errs,
				Error:   "conflict_error",
			})
			return
		}

		PrintError(w, "server_error", "Internal Server Error", http.StatusInternalServerError)
		return
	}
	lastID, errorr := lastInsert.LastInsertId()
	if errorr != nil {
		PrintError(w, "server_error", "Internal Server Error", http.StatusInternalServerError)
		return
	}

	BroadcastAll(Hub_, map[string]any{
		"type": "new_user",
		"data": utils.UserData{
			Id:       int(lastID),
			UserName: data.Nickname,
			IsOnline: false,
		},
	})

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(utils.ResponseApi{
		Success: true,
		Message: "Registration successfuly",
	})
}
