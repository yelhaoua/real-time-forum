package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"path/filepath"

	"real-time-forum/utils"

	"github.com/google/uuid"
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
		fmt.Println("parse err", err)
		return
	}
	postTitle := r.FormValue("posttitle")
	postDesc := r.FormValue("postdesc")

	file, handler, err := r.FormFile("postimage")
	if err != nil {
		fmt.Println("err", err)
		return
	}
	defer file.Close()

	imageExt := filepath.Ext(handler.Filename)
	newImagName := uuid.New().String() + imageExt
	fmt.Println(postDesc, postTitle, newImagName)
}
