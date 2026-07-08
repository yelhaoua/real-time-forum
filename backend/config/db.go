package config

import (
	"database/sql"
	"fmt"

	_ "modernc.org/sqlite"
)

var Conn *sql.DB

func DbConnect() {
	DB, err := sql.Open("sqlite", "./real-time-forum.db")
	if err != nil {
		fmt.Println("Connect Err", err)
		return
	}
	Conn = DB
	testTAble()

	q := `CREATE TABLE users`
	Conn.Exec(q)
	fmt.Println("Connected")
}
