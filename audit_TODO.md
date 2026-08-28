Audit remediation TODOs

- Fix: `frontend/templates/register.html` — change `name="Nickname"` to `name="nickname"` so the form payload keys match backend `RegisterData` JSON tags.
- Fix: In `backend/handlers/HandleMessages` (in `backend/handlers/handleSendMessage.go`) enrich outgoing WebSocket messages with `sender_name` and `timestamp` before calling `SendToUser` so real-time messages include name and date.
- Fix: In `backend/handlers/hnadleGetUser.go` `GetUsersList` — add `ORDER BY` clause to sort users either alphabetically or by last message timestamp (depending on desired behaviour). To sort by last message, join `direct_messages` and use `MAX(timestamp)` grouped by user.
- Fix: In `frontend/js/componentes/messages.js` cleanup callback references `wsProvider.off` (undefined). Use the `off` function imported from `../shared/ws-provider.js` and remove listeners accordingly. Also ensure `connect()` is called (it is in `frontend/app.js`) and `disconnect()` on logout.
- Fix: Ensure WebSocket server attaches `sender_name` and `timestamp` when broadcasting messages and for presence notifications include `type` `user_online`/`user_offline`.
- Fix: `frontend/templates/post-details.html` vs `backend/handlers/hnadlePostDetailes.go` consistency — decide if viewing post details should require authentication; currently backend requires session.
- Improve: Add throttling wrapper in `frontend/js/componentes/messages.js` for `handleScroll` if desired; current `loadingMore` flag prevents spam, but a debounce/throttle improves reliability.
- Security: `backend/handlers/handlerLogin.go` sets cookie `Secure: true`. Ensure environment detection sets `Secure` only when serving HTTPS locally or in production.
- Dependency check: Compare `backend/go.mod` modules (`github.com/google/uuid`, `github.com/gorilla/websocket`, `golang.org/x/crypto`, `modernc.org/sqlite`, plus indirect deps) against the project's allowed packages list and remove/replace any disallowed packages.
- Monitoring: Add simple logging and a health endpoint (`/healthz`) and enable structured logs for WebSocket errors and DB failures. Consider exporting metrics (Prometheus) or at minimum write errors to a file for later analysis.

How to monitor (quick setup):

- Add a `/healthz` handler in `backend/routes/routes.go` that returns 200 when DB ping and basic hub status ok.
- Log WebSocket errors and DB insert failures using a logger (e.g. standard `log` package to a rotating file) so you can monitor repeated failures.
- Optionally add a simple Prometheus `/metrics` endpoint with counts for messages sent, DB errors, and active connections.

Save this file and I can implement any of the fixes you want prioritized next.