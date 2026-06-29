package handler

import (
	"encoding/json"
	"fmt"
	"net/http"

	"real-time-forum/utils"
)

func HnadleCreatPost(w http.ResponseWriter, r *http.Request) {
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
	w.Header().Set("Content-Type", "application/json")
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		fmt.Println(err.Error())
		return
	}
	post := r.FormValue("newpost")
	file, handler, err := r.FormFile("postimage")
	if err != nil {
		defer file.Close()
		fmt.Println("err", err.Error())
		return
	}

	fmt.Println(file, post, handler)
}
