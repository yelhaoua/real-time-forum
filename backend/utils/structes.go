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
