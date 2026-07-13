package routes

import (
	"net/http"

	handler "real-time-forum/handlers"
	"real-time-forum/middleware"
)

func Routes() *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("/", handler.HandleRoot)
	mux.Handle("/register" ,middleware.RateLimit(http.HandlerFunc( handler.HandleRegister)))
	mux.Handle("/login" ,middleware.RateLimit(http.HandlerFunc( handler.LoginHandler)))
	mux.HandleFunc("/logout", handler.LogoutHandler)
	mux.Handle("/craet-post" ,middleware.RateLimit(http.HandlerFunc( handler.HnadleCreatPost)))
	mux.HandleFunc("/post/{id}", handler.HnadlePostDetailes)
	mux.HandleFunc("/posts", handler.FeedHanlder)
	mux.HandleFunc("/comment/{id}", handler.HnadleComments)
	mux.HandleFunc("/creat-commente/{postId}", handler.HnadleAddComments)
	mux.HandleFunc("/getinfo", handler.HnadleGetInfo)
	mux.HandleFunc("/getuser", handler.HnadleGetUser)
	mux.HandleFunc("/getcahtinfo/{id}", handler.HnadleGetChatInfo)
	mux.HandleFunc("/ws", handler.HandleSendMessage)
	mux.HandleFunc("/messages", handler.GetMessages)
	mux.HandleFunc("/checksession", handler.HnadleCheakSession)

	return mux
}
