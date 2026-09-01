package handler

import (
	"net/http"
	"os"
	"path/filepath"
)


func HandleRoot(w http.ResponseWriter, r *http.Request) {
	frontendDir := "../frontend"

	path := filepath.Join(frontendDir, r.URL.Path)
	info, err := os.Stat(path)
	if os.IsNotExist(err) || info.IsDir() {
		http.ServeFile(w, r, filepath.Join(frontendDir, "index.html"))
		return
	}
	
	http.FileServer(http.Dir(frontendDir)).ServeHTTP(w, r)
}
