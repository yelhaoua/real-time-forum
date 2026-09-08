# Real-Time Forum

A full-stack real-time forum application built with Go and vanilla JavaScript. Features posts with categories, comments, voting, and live private messaging via WebSockets.

## Tech Stack

- **Backend:** Go (net/http, gorilla/websocket)
- **Database:** SQLite (pure-Go driver, no CGO required)
- **Frontend:** Vanilla JavaScript (ES Modules, no build tools)
- **Auth:** Bcrypt password hashing, HTTP-only session cookies

## Features

- **User Authentication** — Registration, login, session-based auth with 24h expiry
- **Posts & Feed** — Create posts with title, content, category, and optional image (max 1MB)
- **Categories** — Sport, Games, Filmes, Kitchen, News, Market, Others
- **Voting** — Like/dislike posts and comments (mutually exclusive)
- **Comments** — Comment on any post
- **Real-Time Chat** — One-on-one private messaging via WebSockets
- **Typing Indicators** — See when someone is typing a message
- **Online Presence** — Real-time online/offline status for all users
- **Notifications** — Unread message badges and toast notifications
- **User Search** — Search users by nickname
- **Infinite Scroll** — Paginated feed using IntersectionObserver
- **Rate Limiting** — 10 req/min per IP on auth and post creation endpoints
- **Responsive Design** — Mobile-friendly with hamburger menu

## Project Structure

```
real-time-forum/
├── run.sh                    # Startup script
├── backend/
│   ├── main.go               # Entry point (server on :9090)
│   ├── config/               # DB connection & schema
│   ├── handlers/             # HTTP handlers & WebSocket hub
│   ├── middleware/            # Rate limiter
│   ├── utils/                # Helpers (session, CORS, structs)
│   └── uploads/              # Uploaded images
└── frontend/
    ├── index.html            # SPA entry point
    ├── app.js                # Client-side router & WS events
    ├── js/                   # Modules (pages, shared, WS client)
    └── assets/               # CSS & images
```

## Getting Started

### Prerequisites

- Go 1.21+

### Run

```bash
./run.sh
```

Or directly:

```bash
cd backend && go run .
```

The app is available at **http://localhost:9090**.

The SQLite database is auto-created on first run — no setup required.

## Configuration

All settings are hardcoded in the source:

| Setting | Value | Location |
|---|---|---|
| Server port | `9090` | `backend/main.go` |
| Database file | `./real-time-forum.db` | `backend/config/db.go` |
| Session duration | 24 hours | `backend/handlers/handlerLogin.go` |
| Rate limit | 10 req/min | `backend/middleware/rate-limite.go` |
| Max upload size | 1MB | `backend/handlers/handleCreatPost.go` |
| WebSocket URL | `ws://localhost:9090/ws` | `frontend/js/ws.js` |
