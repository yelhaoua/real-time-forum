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
		PrintError(w, "method_error", "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		PrintError(w, "request_error", "Invalid JSON", http.StatusBadRequest)
		return
	}

	identifier := strings.TrimSpace(req.LoginInput)
	if identifier == "" {
		identifier = strings.TrimSpace(req.Username)
	}

	if identifier == "" || req.Password == "" {
		PrintError(w, "input_error", "Username/email and password are required", http.StatusBadRequest)
		return
	}

	var userID int
	var hashedPassword string

	query := `SELECT id, password FROM users WHERE nick_name = ? OR email = ?`
	err := config.Conn.QueryRow(query, identifier, identifier).Scan(&userID, &hashedPassword)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			PrintError(w, "auth_error", "Invalid username/email or password", http.StatusUnauthorized)
			return
		}

		PrintError(w, "server_error", "Internal Server Error", http.StatusInternalServerError)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(req.Password)); err != nil {
		PrintError(w, "auth_error", "Invalid username/email or password", http.StatusUnauthorized)
		return
	}

	_, _ = config.Conn.Exec(`DELETE FROM sessions WHERE user_id = ?`, userID)

	sessionToken := uuid.New().String()
	expiresAt := time.Now().Add(24 * time.Hour)

	sessionQuery := `INSERT INTO sessions (user_id, token,expration_date) VALUES (?, ?, ?)`
	_, err = config.Conn.Exec(sessionQuery, userID, sessionToken, expiresAt)
	if err != nil {
		fmt.Println("err", err)
		PrintError(w, "server_error", "Internal Server Error", http.StatusInternalServerError)
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
