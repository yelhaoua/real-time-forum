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

type User struct {
	Email string `json:email`
	Pass  string `json:pass`
}

func JsonEncoder(w http.ResponseWriter, message string, code int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusBadRequest)
	json.NewEncoder(w).Encode(map[string]string{
		"message": message,
	})
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	utils.EnableCors(w)

	var UserID int
	var UserPass string

	if r.Method == http.MethodOptions {
		fmt.Println("OPTIONS received")
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method == http.MethodPost {
		var user User
		fmt.Println("POST received")

		err := json.NewDecoder(r.Body).Decode(&user)
		if err != nil {
			JsonEncoder(w, err.Error(), http.StatusBadRequest)
			return
		}
		if user.Email == "" || user.Pass == "" {
			JsonEncoder(w, "The login details not valid", http.StatusBadRequest)
			return
		}

		err = config.Conn.QueryRow(
			"SELECT id, password FROM users WHERE username = ? OR email = ?",
			user.Email,
			user.Email,
		).Scan(&UserID, &UserPass)
		if err != nil {
			JsonEncoder(w, "Invalid username or password", http.StatusBadRequest)
			return
		}

		err = bcrypt.CompareHashAndPassword([]byte(UserPass), []byte(user.Pass))
		if err != nil {
			JsonEncoder(w, "Invalid username or password", http.StatusBadRequest)
			return
		}

		generatedToken := uuid.New().String()

		_, err = config.Conn.Exec(`INSERT INTO sessions (user_id , token , expration_date) VALUES(? , ? , ?)`, UserID, generatedToken, time.Now().Add(24*time.Hour))
		if err != nil {
			JsonEncoder(w, "We can't create session token", http.StatusInternalServerError)
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
		return
	}
	JsonEncoder(w, "Method not allowed", http.StatusMethodNotAllowed)
}
