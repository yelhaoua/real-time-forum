package config

import (
	"database/sql"
	"fmt"

	_ "github.com/mattn/go-sqlite3"
)

var Conn *sql.DB

func DbConnect() {
	DB, err := sql.Open("sqlite3", "./real-time-forum.db?_busy_timeout=5000")
	if err != nil {
		fmt.Println("Connect Err", err)
		return
	}
	Conn = DB
	testTAble()

	_, err = Conn.Exec("PRAGMA journal_mode=WAL;")
	if err != nil {
		fmt.Println("WAL mode err:", err)
	}

	_, _ = Conn.Exec("PRAGMA synchronous=NORMAL;")
	fmt.Println("Connected")
}
