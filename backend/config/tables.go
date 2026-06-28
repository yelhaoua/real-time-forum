package config

import "fmt"

func testTAble() {
	tx, err := Conn.Begin()
	if err != nil {
		fmt.Println("Error starting transaction:", err)
		return
	}

	queries := []string{
		`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`,
		`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
)`,
		`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)`,
		`CREATE TABLE IF NOT EXISTS post_categories (
    post_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (post_id, category_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
)`,
		`CREATE TABLE IF NOT EXISTS sessions (
id INTEGER PRIMARY KEY AUTOINCREMENT ,
user_id int NOT NULL,
token text UNIQUE NOT NULL,
expration_date datetime NOT NULL,
FOREIGN KEY (user_id) REFERENCES users(id)
)`,
		`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)`,
		`CREATE TABLE IF NOT EXISTS votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    post_id INTEGER,
    comment_id INTEGER,
    vote_value INTEGER CHECK (vote_value IN (1, -1)),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    UNIQUE(user_id, post_id),
    UNIQUE(user_id, comment_id)
)`,
	}

	for _, q := range queries {
		if _, err := tx.Exec(q); err != nil {
			tx.Rollback()
			fmt.Println("Error creating table:", err)
			return
		}
	}
	_, err = tx.Exec(`INSERT INTO categories (name) VALUES (?), (?), (?), (?), (?), (?), (?) ON CONFLICT(name) DO NOTHING`,
		"sport", "games", "filmes", "kitchen", "news", "market", "others")
	if err != nil {
		tx.Rollback()
		fmt.Println("Error inserting categories:", err)
		return
	}
	err = tx.Commit()
	if err != nil {
		fmt.Println("Error committing transaction:", err)
	}
	fmt.Println("ALlgode")
}
