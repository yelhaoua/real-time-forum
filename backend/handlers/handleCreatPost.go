package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"time"

	"real-time-forum/config"
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
	const MAXUPLOADSIZE = 1024 * 1024

	r.Body = http.MaxBytesReader(w, r.Body, MAXUPLOADSIZE)

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

	err = r.ParseMultipartForm(MAXUPLOADSIZE)
	if err != nil {

		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "File too large. Maximum size is 1MB",
			Error:   "form-error",
		})
		return
	}
	postTitle := r.FormValue("posttitle")
	postDesc := r.FormValue("postdesc")
	postCategory := r.FormValue("category")
	hassErr := false
	if len(postTitle) > 50 || len(postTitle) < 3 {
		hassErr = true
		postErrors.TitleError = "your title must have betwen 3 and 50 char"
	}

	if len(postDesc) > 500 || len(postDesc) < 10 {
		hassErr = true
		postErrors.DescErr = "your description must have betwen 10 and 500 char"
	}

	if postCategory == "" {
		hassErr = true
		postErrors.CateErr = "please select a category"
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

		if imageExt != ".jpg" && imageExt != ".jpeg" && imageExt != ".png" && imageExt != ".gif" {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(utils.ResponseApi{
				Success: false,
				Message: "Invalid image format. Only JPG, JPEG, PNG, and GIF are allowed.",
				Error:   "image_error",
			})
			return
		}
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

	postId, err := res.LastInsertId()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "Error while saving data",
			Error:   "server_error",
		})
		return
	}

	var categoryId int64
	err = config.Conn.QueryRow(`SELECT id FROM categories WHERE name = ?`, postCategory).Scan(&categoryId)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "Invalid category",
			Error:   "form-error",
		})
		return
	}

	_, err = config.Conn.Exec(`INSERT INTO post_categories (post_id, category_id) VALUES (?, ?)`, postId, categoryId)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(utils.ResponseApi{
			Success: false,
			Message: "Error while saving data",
			Error:   "server_error",
		})
		return
	}

	json.NewEncoder(w).Encode(utils.ResponseApi{
		Success: true,
		Message: "Post created successfully",
	})
}
