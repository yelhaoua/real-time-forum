real-time-forum audit todo
=========================

Overall rating: 6.5/10
- Subject coverage: 8/10
- Audit readiness: 5/10
- Backend reliability: 6/10
- Frontend SPA correctness: 5/10
- Real-time messaging quality: 5/10
- Security and robustness: 4/10

Summary
-------
The project already implements the main forum concepts from the subject: registration/login, post creation, comments, feed display, private messages, and a basic websocket flow. The biggest problem is not missing features alone; it is reliability. The app feels like a working prototype rather than a finished project that would pass the audit checklist without issues.

What is already good
--------------------
- Auth endpoints and session-based login/logout exist.
- Posts, comments, and feed views are implemented.
- Private messaging UI and websocket connection setup exist.
- The app uses a hash-based SPA structure.
- The backend uses parameterized SQL queries, which is a good base.

Main issues to fix
------------------
1. Auth and session flow
- Fix the frontend session check so it properly handles unauthorized and expired sessions.
- Make login/register/logout redirect through the SPA router instead of brittle full-page redirects.
- Ensure protected pages block unauthenticated users consistently.
- Best method: centralize auth state in one helper and use it for all pages.

2. Frontend event and state management
- Remove duplicate global listeners that can stack across route changes.
- Make each page mount once and cleanly reset old state before rendering again.
- Avoid re-attaching listeners on every render.
- Best method: use one page lifecycle function per component and teardown old listeners before mounting new ones.

3. Backend compile/runtime issues
- Remove the self-assignment in the messaging handler.
- Check rows.Err() after SQL loops.
- Fix log.Printf formatting issues.
- Fix the tautological session check logic.
- Best method: run go build ./... after every backend change and fix compiler warnings immediately.

4. Posts and comments correctness
- Make sure post detail responses show the real post author, not the current user.
- Validate that the target post exists before loading or commenting on it.
- Prevent duplicate submissions when the user clicks multiple times.
- Best method: add server-side validation and frontend loading/disabled states.

5. Private messaging reliability
- Replace the current ad-hoc websocket payloads with a clear message structure.
- Separate presence events like online/offline notifications from real chat messages.
- Make the message list update correctly for both sender and receiver without duplication.
- Ensure the chat list is sorted by last message time, with alphabetical fallback for new users.
- Best method: use a single message schema and one websocket event handler for all chat updates.

6. Message history and infinite loading
- Load only the last 10 messages initially.
- Implement scroll-based loading for older messages using throttle/debounce.
- Avoid spamming the scroll event.
- Best method: use a throttled scroll listener and request only once per window of scroll activity.

7. Security and XSS hardening
- Escape all user-generated content before rendering it in HTML.
- Sanitize and trim inputs on the server before storing them.
- Do not expose sensitive internals in error messages.
- Best method: validate on the backend first, then sanitize on the frontend only for display.

Priority plan
-------------
P0 - Must fix first
- Auth/session flow
- Backend compiler/runtime issues
- SPA redirect issues
- Duplicate listener issues

P1 - High value fixes
- Websocket message schema and presence handling
- Chat history loading and ordering
- Real-time notification delivery

P2 - Feature quality
- Post/comment validation and correctness
- Scroll-based loading for chat history
- Better loading/error states and UI polish

P3 - Nice to have
- Edit/delete for posts and comments
- Better profiles/avatars
- Pagination and search
- Automated tests for auth, posts, comments, and chat

Suggested implementation order
------------------------------
1. Fix auth/session and routing first.
2. Fix backend compile and runtime issues.
3. Stabilize websocket and chat state.
4. Fix post/comment behavior and data correctness.
5. Add tests and polish for audit readiness.

Expected result after this work
-------------------------------
After these fixes, the project should be much closer to the subject requirements and the audit checklist: login/register should feel reliable, posts/comments should work consistently, and private messages should behave like a real-time chat system instead of a prototype.
