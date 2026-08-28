package handler

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"real-time-forum/config"
	"real-time-forum/utils"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type LoginRequest struct {
	LoginInput string `json:"email"`    
	Username   string `json:"username"` 
	Password   string `json:"pass"`
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	utils.EnableCors(w)

	if r.Method == http.MethodOptions {
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

	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "Invalid JSON body",
			Error:   "request_error",
		})
		return
	}

	identifier := strings.TrimSpace(req.LoginInput)
	if identifier == "" {
		identifier = strings.TrimSpace(req.Username)
	}

	if identifier == "" || req.Password == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "Credentials are required",
			Error:   "input_error",
		})
		return
	}

	var userID int
	var hashedPassword string

	query := `SELECT id, password FROM users WHERE nick_name = ? OR email = ?`
	err := config.Conn.QueryRow(query, identifier, identifier).Scan(&userID, &hashedPassword)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(utils.ResponseApi{
				Success: false,
				Message: "Invalid username/email or password",
				Error:   "auth_error",
			})
			return
		}

		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "Internal server error",
			Error:   "server_error",
		})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(req.Password)); err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "Invalid username/email or password",
			Error:   "auth_error",
		})
		return
	}

	_, _ = config.Conn.Exec(`DELETE FROM sessions WHERE user_id = ?`, userID)

	sessionToken := uuid.New().String()
	expiresAt := time.Now().Add(24 * time.Hour)

	sessionQuery := `INSERT INTO sessions (user_id, token,expration_date) VALUES (?, ?, ?)`
	_, err = config.Conn.Exec(sessionQuery, userID, sessionToken, expiresAt)
	if err != nil {
		fmt.Println("err", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "Could not create session",
			Error:   "server_error",
		})
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "Form_Token",
		Value:    sessionToken,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		Expires:  expiresAt,
		MaxAge:   86400,
		SameSite: http.SameSiteLaxMode,
	})

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(utils.ResponseApi{
		Success: true,
		Message: "Logged in successfully",
	})
}
