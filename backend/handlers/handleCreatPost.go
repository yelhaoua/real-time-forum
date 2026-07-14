package handler

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strconv"
	"time"

	"real-time-forum/config"
	"real-time-forum/utils"

	"github.com/google/uuid"
)

func checkcategori(categori []string) bool {
	if len(categori) == 0 {
		return true
	}
	for _, val := range categori {
		num, err := strconv.Atoi(val)
		if err != nil {
			return true
		}
		if num < 1 || num > 7 {
			return true
		}
	}
	return false
}

func InsertInCategorise(categorise []string, DB *sql.DB, id int) error {
	for _, val := range categorise {
		_, err := DB.Exec(`INSERT INTO post_categories (post_id , category_id) VALUES (?, ?)`, id, val)
		if err != nil {
			return err
		}
	}
	return nil
}

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

	id, err := utils.CheckSession(w, r)
	if err != nil {
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "you session is invalid pleas log in",
			Error:   "auth_err",
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")

	var postErrors struct {
		TitleError string `json:"title_error"`
		DescErr    string `json:"desc_error"`
		CateErr    string `json:"cate_error"`
		ImgErr     string `json:"image_error"`
	}

	err = r.ParseMultipartForm(10 << 20)
	if err != nil {

		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "invalid from content",
			Error:   "form-error",
		})
		return
	}
	postTitle := r.FormValue("posttitle")
	postDesc := r.FormValue("postdesc")
	hassErr := false
	if len(postTitle) > 50 || len(postTitle) < 3 {
		hassErr = true
		postErrors.TitleError = "your title must have betwen 3 and 50 char"
	}

	if len(postDesc) > 500 || len(postDesc) < 10 {
		hassErr = true
		postErrors.DescErr = "your description must have betwen 10 and 500 char"
	}

	if hassErr {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Data:    postErrors,
		})
		return
	}

	file, handler, err := r.FormFile("postimage")

	imagpath := ""

	if err == nil {

		defer file.Close()
		imgDir := "./uploads"

		_, err = os.Stat(imgDir)
		if os.IsNotExist(err) {
			os.Mkdir(imgDir, os.ModePerm)
		}
		imageExt := filepath.Ext(handler.Filename)
		newImagName := uuid.New().String() + imageExt
		imagpath = path.Join(imgDir, newImagName)
		dst, err := os.Create(imagpath)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(utils.ResponseApi{
				Success: false,
				Message: "Error in saving image",
				Error:   "server_error",
			})
			return
		}

		defer dst.Close()

		_, err = io.Copy(dst, file)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(utils.ResponseApi{
				Success: false,
				Message: "Error in saving image",
				Error:   "server_error",
			})
			return
		}
		imagpath = fmt.Sprintf("http://localhost:9090/%s", imagpath)
	}

	query := `INSERT INTO posts (user_id  ,title ,content ,image_url ,created_at) VALUES (? ,? ,? ,? ,?)`
	res, err := config.Conn.Exec(query, id, postTitle, postDesc, imagpath, time.Now())
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "Error while saving data",
			Error:   "server_error",
		})
		return
	}
	fmt.Println(res.LastInsertId())
	json.NewEncoder(w).Encode(utils.ResponseApi{
		Success: true,
		Message: "post create succsesfuly",
	})
}
