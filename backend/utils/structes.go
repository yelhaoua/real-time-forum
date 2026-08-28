package utils

import "time"

type ResponseApi struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
	Error   string      `json:"error"`
}

type LoginError struct {
	UserNameErr string `json:"user_name_err"`
	LoginErr    string `json:"login_err"`
	PasswordErr string `json:"password_err"`
}

type Posts struct {
	Id            int    `json:"id"`
	Title         string `json:"title"`
	UserName      string `json:"user_name"`
	Content       string `json:"content"`
	Creat_at      string `json:"creat_at"`
	Image_url     string `json:"image_url"`
	Isliked       bool   `json:"is_like"`
	IsDisliked    bool   `json:"is_dislike"`
	LikeCount     int    `json:"like_count"`
	DislikeCount  int    `json:"dislike_count"`
	CommentsCount int    `json:"comment_count"`
}

type Comment struct {
	Id           int    `json:"id"`
	UserName     string `json:"use_name"`
	Content      string `json:"content"`
	Isliked      bool   `json:"is_liked"`
	IsDisliked   bool   `json:"is_disliked"`
	Creat_at     string `json:"creat_at  "`
	LikeCount    int    `json:"like_count"`
	DislikeCount int    `json:"dislike_count"`
}

type FeedStruct struct {
	AllPosts    []Posts   `json:"all_posts"`
	AllComments []Comment `json:"all_commentes"`
}

type Actions struct {
	Actions string `json:"action"`
	ID      int    `json:"id"`
}

type Message struct {
	SenderID    int       `json:"sender_id"`
	RecipientID int       `json:"recipient_id"`
	Content     string    `json:"content"`
	Timestamp   time.Time `json:"timestamp"`
}

type UserData struct {
	Id            string `json:"id"`
	UserName      string `json:"user_name"`
	ProfileImage  string `json:"profile_image"`
	IsOnline      bool   `json:"is_online"`
	UnreadCount   int    `json:"unread_count"`
	LastMessageAt string `json:"last_message_at"`
}
