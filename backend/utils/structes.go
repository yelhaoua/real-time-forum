package utils

type ResponseApi struct {
	Success bool
	Message string
	Data    interface{}
	Errore  string
}

type LoginError struct {
	UserNameErr string
	LoginErr    string
	PasswordErr string
}

type Posts struct {
	Id           int
	Title        string
	UserName     string
	Content      string
	Creat_at     string
	Image_url   string
	Isliked      bool
	IsDisliked   bool
	LikeCount    int
	DislikeCount int
}

type Comment struct {
	Id           int
	UserName     string
	Content      string
	Isliked      bool
	IsDisliked   bool
	Creat_at     string
	LikeCount    int
	DislikeCount int
}

type FeedStruct struct {
	AllPosts    []Posts
	AllComments []Comment
}

type Actions struct {
    Actions string `json:"action"`
    ID      int    `json:"id"`
}