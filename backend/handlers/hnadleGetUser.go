package handler

import (
	"encoding/json"
	"fmt"
	"net/http"

	"real-time-forum/config"
	"real-time-forum/utils"
)

func HnadleGetUser(w http.ResponseWriter, r *http.Request) {
	utils.EnableCors(w)

	w.Header().Set("Content-Type", "application/json")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	userID, err := utils.CheckSession(w, r)
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "please log in",
			Error:   "unauthorized_error",
		})
		return
	}

	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "method not allowed",
			Error:   "method_error",
		})
		return
	}
	type userData struct {
		Id            string `json:"id"`
		UserName      string `json:"user_name"`
		Profile_image string `json:"profile_image"`
	}

	var data string

	err = json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "error in json body",
			Error:   "request_error",
		})
		return
	}

	fmt.Println("data", data)
	if data == "" {
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: true,
			Data:    []string{},
		})
		return
	}

	query := `SELECT id, nick_name, profile_image FROM users WHERE nick_name LIKE ? AND id != ?`

	rows, err := config.Conn.Query(query, "%"+data+"%", userID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "database query error",
			Error:   err.Error(),
		})
		return
	}

	defer rows.Close()

	var users []userData

	for rows.Next() {
		var user userData
		err := rows.Scan(&user.Id, &user.UserName, &user.Profile_image)
		if err != nil {
			fmt.Println(user, err)
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(utils.ResponseApi{
				Success: false,
				Message: "error scanning users",
				Error:   err.Error(),
			})
			return
		}

		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "error reading users",
			Error:   err.Error(),
		})
		return
	}
	fmt.Println(users)
	json.NewEncoder(w).Encode(utils.ResponseApi{
		Success: true,
		Data:    users,
	})
}

func GetUsersList(w http.ResponseWriter, r *http.Request) {
    utils.EnableCors(w)

    w.Header().Set("Content-Type", "application/json")

    if r.Method == http.MethodOptions {
        w.WriteHeader(http.StatusOK)
        return
    }

    userId, err := utils.CheckSession(w, r)
    if err != nil {
        w.WriteHeader(http.StatusUnauthorized)
        json.NewEncoder(w).Encode(utils.ResponseApi{
            Success: false,
            Message: "please log in",
            Error:   "unauthorized_error",
        })
        return
    }

    if r.Method != http.MethodGet {
        w.WriteHeader(http.StatusMethodNotAllowed)
        json.NewEncoder(w).Encode(utils.ResponseApi{
            Success: false,
            Message: "method not allowed",
            Error:   "method_error",
        })
        return
    }

    query := `SELECT id, nick_name, profile_image FROM users WHERE id != ?`

    rows, err := config.Conn.Query(query, userId)
    if err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        json.NewEncoder(w).Encode(utils.ResponseApi{
            Success: false,
            Message: "database query error",
            Error:   err.Error(),
        })
        return
    }
    defer rows.Close()

    var users []utils.UserData

    for rows.Next() {
        var user utils.UserData
        err := rows.Scan(&user.Id, &user.UserName, &user.ProfileImage)
        if err != nil {
            fmt.Println(user, err)
            w.WriteHeader(http.StatusInternalServerError)
            json.NewEncoder(w).Encode(utils.ResponseApi{
                Success: false,
                Message: "error scanning users",
                Error:   err.Error(),
            })
            return
        }
		var dbIdInt int
        fmt.Sscanf(user.Id, "%d", &dbIdInt)

        Mu.Lock()
        _, isOnline := Clients[dbIdInt]
        Mu.Unlock()

        user.IsOnline = isOnline
        users = append(users, user)

    }
    
    if err := rows.Err(); err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        json.NewEncoder(w).Encode(utils.ResponseApi{
            Success: false,
            Message: "error reading users",
            Error:   err.Error(),
        })
        return
    }
    
    json.NewEncoder(w).Encode(utils.ResponseApi{
        Success: true,
        Data:    users,
    })
}
