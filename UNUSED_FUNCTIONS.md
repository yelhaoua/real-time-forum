# Unused Functions and Dead Code Report

This report documents all unused functions, unreachable modules, and dormant endpoints identified across the backend and frontend of the project.

---

## 1. Backend Dead Code

### [`calculateAge`](file:///home/haitbenal/Desktop/real-time-forum/backend/handlers/handleRegister.go#L56-L63)
* **File:** [`backend/handlers/handleRegister.go`](file:///home/haitbenal/Desktop/real-time-forum/backend/handlers/handleRegister.go) (Lines 56–63)
* **Signature:** `func calculateAge(birthDate time.Time) int`
* **Status:** Unused
* **Reason:** Intended to compute age from a birth date, but in [`ValidateRegistration`](file:///home/haitbenal/Desktop/real-time-forum/backend/handlers/handleRegister.go#L65-L113) (line 101), age is parsed directly from the string field `data.Age` using `strconv.Atoi(data.Age)`. `calculateAge` is never called anywhere in the codebase.

---

## 2. Backend Handlers Not Called by the Client

These handlers are registered to HTTP routes in [`backend/routes/routes.go`](file:///home/haitbenal/Desktop/real-time-forum/backend/routes/routes.go), but are not requested by the active frontend application:

### [`GetMessages`](file:///home/haitbenal/Desktop/real-time-forum/backend/handlers/handleSendMessage.go#L121-L150)
* **File:** [`backend/handlers/handleSendMessage.go`](file:///home/haitbenal/Desktop/real-time-forum/backend/handlers/handleSendMessage.go) (Lines 121–150)
* **Route:** `GET /messages` ([`routes.go:26`](file:///home/haitbenal/Desktop/real-time-forum/backend/routes/routes.go#L26))
* **Status:** Dormant HTTP Endpoint
* **Reason:** The frontend does not call `GET http://localhost:9090/messages`. The chat interface retrieves conversation history for a specific recipient using `/getcahtinfo/{id}` instead of this bulk dump endpoint.

### [`HnadleGetUser`](file:///home/haitbenal/Desktop/real-time-forum/backend/handlers/hnadleGetUser.go#L12-L119)
* **File:** [`backend/handlers/hnadleGetUser.go`](file:///home/haitbenal/Desktop/real-time-forum/backend/handlers/hnadleGetUser.go) (Lines 12–119)
* **Route:** `POST /getuser` ([`routes.go:23`](file:///home/haitbenal/Desktop/real-time-forum/backend/routes/routes.go#L23))
* **Status:** Dormant HTTP Endpoint
* **Reason:** This user search endpoint is only referenced in `frontend/js/componentes/pepole-list.js`, which is orphaned and never mounted or imported in the active application.

---

## 3. Orphaned Legacy Frontend Architecture

The active Single-Page Application (SPA) entry point is [`frontend/app.js`](file:///home/haitbenal/Desktop/real-time-forum/frontend/app.js) (loaded by [`frontend/index.html`](file:///home/haitbenal/Desktop/real-time-forum/frontend/index.html)). It configures its own router (`ROUTES`) and only imports:
* `frontend/js/ws.js`
* `frontend/js/ui.js`
* `frontend/js/nav.js`
* `frontend/js/pages/auth.js`
* `frontend/js/pages/feed.js`
* `frontend/js/pages/post.js`
* `frontend/js/pages/create.js`
* `frontend/js/pages/messages.js`

An older component/shared module tree was replaced by the `frontend/js/pages/` structure. None of the files in `frontend/js/routes/`, `frontend/js/componentes/`, and `frontend/js/shared/` are imported by `app.js` or any active module. All functions in those files are dead code.

### A. Standalone / Unreferenced Modules
* **[`NotFoundPage`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/componentes/not-found.js#L1-L4)** in `frontend/js/componentes/not-found.js` — Not imported anywhere (the active app defines an inline 404 handler in `app.js:17`).
* **[`ChatList`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/componentes/pepole-list.js#L3-L114)** and **[`renderUsers`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/componentes/pepole-list.js#L46-L86)** in `frontend/js/componentes/pepole-list.js` — Never imported or rendered.
* **[`routes`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/routes/routes.js#L10-L54)** in `frontend/js/routes/routes.js` — Never imported; `app.js` has its own `ROUTES` object.

### B. Superseded Page & Navigation Components
* **[`HomePage`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/componentes/home-page.js#L5-L7)** in `frontend/js/componentes/home-page.js`
* **[`NavBar`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/componentes/nave-bare.js#L4-L109)** (including inner functions `renderNav` and `toggleMenu`) in `frontend/js/componentes/nave-bare.js` *(superseded by `frontend/js/nav.js`)*
* **[`loginforum`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/componentes/auth/login-forum.js#L6-L29)** and **[`handleFormSubmit`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/componentes/auth/login-forum.js#L31-L46)** in `frontend/js/componentes/auth/login-forum.js` *(superseded by `LoginPage` in `pages/auth.js`)*
* **[`RegisterForm`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/componentes/auth/register-form.js#L5-L26)** and **[`handleFormSubmit`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/componentes/auth/register-form.js#L28-L44)** in `frontend/js/componentes/auth/register-form.js` *(superseded by `RegisterPage` in `pages/auth.js`)*
* **[`logout`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/componentes/auth/logout.js#L1-L14)** in `frontend/js/componentes/auth/logout.js` *(superseded by `LogoutPage` in `pages/auth.js`)*
* **[`CreatePost`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/componentes/postes/create-post.js#L5-L44)** in `frontend/js/componentes/postes/create-post.js` *(superseded by `CreatePostPage` in `pages/create.js`)*
* **[`FeedPage`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/componentes/postes/feed.js#L290-L328)** and inner helpers ([`clearOppositeVote`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/componentes/postes/feed.js#L4), [`ToggleLike`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/componentes/postes/feed.js#L31), [`ToggleDislike`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/componentes/postes/feed.js#L86), [`HandlePostActions`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/componentes/postes/feed.js#L147), [`isLoggedIn`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/componentes/postes/feed.js#L167), [`loadPosts`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/componentes/postes/feed.js#L204)) in `frontend/js/componentes/postes/feed.js` *(superseded by `pages/feed.js`)*
* **[`PostDetailes`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/componentes/postes/postDeatailes.js#L12-L41)** in `frontend/js/componentes/postes/postDeatailes.js` *(superseded by `PostPage` in `pages/post.js`)*
* **[`ChatPage`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/componentes/chat-page.js#L3-L167)** and inner helpers ([`getMessages`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/componentes/chat-page.js#L46), [`updateChatDOM`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/componentes/chat-page.js#L73), [`renderChat`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/componentes/chat-page.js#L86)) in `frontend/js/componentes/chat-page.js` *(superseded by `pages/messages.js`)*
* **[`Messages`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/componentes/messages.js#L10-L606)** and all 18 internal functions in `frontend/js/componentes/messages.js`:
  * `createMessageHTML` (line 72)
  * `formatTimestamp` (line 103)
  * `appendSingleMessage` (line 133)
  * `renderFullChatBody` (line 156)
  * `updateHeader` (line 177)
  * `sortUsersByActivity` (line 208)
  * `renderUsersList` (line 233)
  * `fetchUsers` (line 269)
  * `fetchMessagesForUser` (line 288)
  * `selectUser` (line 329)
  * `onChatMessage` (line 363)
  * `onUserOnline` (line 390)
  * `onUserOffline` (line 407)
  * `onNewMessage` (lines 424, 448, 472 — defined 3 times; the first two are shadowed)
  * `handleScroll` (line 496)
  * `handleUserClick` (line 510)
  * `handleSend` (line 517)
  * `handleBack` (line 573)
  *(All superseded by `MessagesPage` in `pages/messages.js`)*

### C. Action Helpers & Sub-components
* **[`LoginAction`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/componentes/auth/actions/login-action.js#L3-L75)** in `frontend/js/componentes/auth/actions/login-action.js`
* **[`RegisterAction`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/componentes/auth/actions/register-action.js#L1-L129)** and **[`clearError`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/componentes/auth/actions/register-action.js#L12-L14)** in `frontend/js/componentes/auth/actions/register-action.js`
* **[`CreatePostAction`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/componentes/postes/actions/creat-post-action.js#L1-L32)** in `frontend/js/componentes/postes/actions/creat-post-action.js`
* **[`PostesDetailesAction`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/componentes/postes/actions/post-details-action.js#L1-L15)** and **[`GetCommetesAction`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/componentes/postes/actions/post-details-action.js#L17-L32)** in `frontend/js/componentes/postes/actions/post-details-action.js`
* **[`CommentForm`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/componentes/ui/add-commente.js#L3-L73)** in `frontend/js/componentes/ui/add-commente.js`
* **[`Banner`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/componentes/ui/baner.js#L1-L39)** in `frontend/js/componentes/ui/baner.js` *(superseded by `Banner` in `js/ui.js`)*
* **[`CardPost`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/componentes/ui/card-post.js#L3-L58)** in `frontend/js/componentes/ui/card-post.js`
* **[`CommentsBox`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/componentes/ui/commentsBox.js#L1-L5)** in `frontend/js/componentes/ui/commentsBox.js`
* **[`Comments`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/componentes/comments.js#L3-L31)** in `frontend/js/componentes/comments.js`

### D. Legacy Shared Utilities
* **[`CheckSession`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/shared/checkSession.js#L1-L12)** in `frontend/js/shared/checkSession.js` *(superseded by `isLoggedIn` in `app.js`)*
* **[`escapeHtml`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/shared/formate-text.js#L1-L8)** in `frontend/js/shared/formate-text.js` *(superseded by `escapeHtml` in `js/ui.js`)*
* **[`validateLogin`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/shared/login-validatore.js#L11-L13)**, **[`validateEmail`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/shared/login-validatore.js#L1-L4)**, **[`validateUsername`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/shared/login-validatore.js#L6-L9)** in `frontend/js/shared/login-validatore.js`
* **WebSocket Utilities** in `frontend/js/shared/ws-provider.js` *(superseded by `frontend/js/ws.js`)*:
  * [`cleanupWs`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/shared/ws-provider.js#L14)
  * [`emit`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/shared/ws-provider.js#L24)
  * [`flushQueue`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/shared/ws-provider.js#L28)
  * [`connect`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/shared/ws-provider.js#L35)
  * [`disconnect`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/shared/ws-provider.js#L83)
  * [`send`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/shared/ws-provider.js#L92)
  * [`on`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/shared/ws-provider.js#L107)
  * [`off`](file:///home/haitbenal/Desktop/real-time-forum/frontend/js/shared/ws-provider.js#L116)
