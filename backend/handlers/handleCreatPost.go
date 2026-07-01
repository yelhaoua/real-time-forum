package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path"
	"path/filepath"

	"real-time-forum/utils"

	"github.com/google/uuid"
)

func HnadleCreatPost(w http.ResponseWriter, r *http.Request) {
	utils.EnableCors(w)
	fmt.Println("hna")
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		utils.EnableCors(w)
		return
	}

	id, err := utils.CheckSession(w, r)
	fmt.Println(id)

	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "method not allowed",
		})
		return
	}
	w.Header().Set("Content-Type", "application/json")
	err = r.ParseMultipartForm(10 << 20)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "invalid from content",
			Errore:  "form-error",
		})
		return
	}
	postTitle := r.FormValue("posttitle")
	postDesc := r.FormValue("postdesc")
	fmt.Println(postDesc, postTitle)

	file, handler, err := r.FormFile("postimage")
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "invalid from content",
			Errore:  "form-error",
		})
		return
	}
	defer file.Close()

	imgDir := "./uploads"

	_, err = os.Stat(imgDir)
	if os.IsNotExist(err) {
		os.Mkdir(imgDir, os.ModePerm)
	}

	imageExt := filepath.Ext(handler.Filename)
	newImagName := uuid.New().String() + imageExt
	imagpath := path.Join(imgDir, newImagName)
	dst, err := os.Create(imagpath)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "errore in saving image",
			Errore:  "server_error",
		})
		return
	}

	defer dst.Close()

	_, err = io.Copy(dst, file)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "errore in saving image",
			Errore:  "server_error",
		})
		return
	}
}
