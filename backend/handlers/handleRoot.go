package handler

import (
	"net/http"
	"os"
	"path/filepath"
)

func HandleRoot(w http.ResponseWriter, r *http.Request) {
	path := filepath.Join("./frontend", r.URL.Path)
	_, err := os.Stat(path)
	if os.IsNotExist(err) {
		http.ServeFile(w, r, "./frontend/index.html")
		return
	}
	http.FileServer(http.Dir("./frontend")).ServeHTTP(w, r)
}
