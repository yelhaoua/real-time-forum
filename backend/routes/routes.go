package routes

import (
	"net/http"

	handler "real-time-forum/handlers"
)

func Routes() *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("/", handler.HandleRoot)
	mux.HandleFunc("/register", handler.HandleRegister)
	mux.HandleFunc("/login", handler.LoginHandler)
	mux.HandleFunc("/logout", handler.LogoutHandler)
	mux.HandleFunc("/craet-post", handler.HnadleCreatPost)
	mux.HandleFunc("/post/{id}", handler.HnadlePostDetailes)
	mux.HandleFunc("/posts", handler.FeedHanlder)

	mux.HandleFunc("/comment/{id}", handler.HnadleComments)
	mux.HandleFunc("/creat-commente/{postId}", handler.HnadleAddComments)
	mux.HandleFunc("/getinfo", handler.HnadleGetInfo)
	mux.HandleFunc("/getuser", handler.HnadleGetUser)
	mux.HandleFunc("/getcahtinfo/{id}", handler.HnadleGetChatInfo)
	mux.HandleFunc("/send-message/{id}", handler.HnadleSendMessage)
	// mux.HandleFunc("/sendmsg", handler.HandleSendMessage)

	return mux
}
