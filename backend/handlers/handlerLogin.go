package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"real-time-forum/config"
	"real-time-forum/utils"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	utils.EnableCors(w)

	var UserID int
	var UserPass string

	if r.Method == http.MethodOptions {
		fmt.Println("OPTIONS received")
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "Method not allowed",
			Error:   "request_error",
		})
		return
	}

	var user struct {
		Email    string `json:"email"`
		Username string `json:"username"`
		Pass     string `json:"pass"`
	}

	fmt.Println("POST received")

	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "bad json body",
			Error:   "request_error",
		})
		return
	}
	// Determine identifier (email or username)
	identifier := user.Email
	if identifier == "" {
		identifier = user.Username
	}
	if identifier == "" || user.Pass == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "The login details not valid",
			Error:   "request_error",
		})
		return
	}

	err = config.Conn.QueryRow(
		"SELECT id, password FROM users WHERE nick_name = ? OR email = ?",
		identifier,
		identifier,
	).Scan(&UserID, &UserPass)
	if err != nil {

		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "Invalid username or password",
			Error:   "request_error",
		})
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(UserPass), []byte(user.Pass))
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "Invalid username or password",
			Error:   "request_error",
		})
		return
	}

	generatedToken := uuid.New().String()

	_, err = config.Conn.Exec(`INSERT INTO sessions (user_id , token , expration_date) VALUES(? , ? , ?)`, UserID, generatedToken, time.Now().Add(24*time.Hour))
	if err != nil {

		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "We can't create session token",
			Error:   "request_error",
		})
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "Form_Token",
		Value:    generatedToken,
		Path:     "/",
		HttpOnly: true,
		Expires:  time.Now().Add(24 * time.Hour),
		MaxAge:   24 * 60 * 60,
		SameSite: http.SameSiteLaxMode,
	})

	json.NewEncoder(w).Encode(utils.ResponseApi{
		Success: true,
		Message: "you are loged in",
	})
}
