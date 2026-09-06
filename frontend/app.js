import { connect, disconnect, on } from "./js/ws.js";
import { Banner } from "./js/ui.js";
import CheckSession from "./js/shared/checkSession.js";
import { LoginPage, RegisterPage, LogoutPage } from "./js/pages/auth.js";
import FeedPage from "./js/pages/feed.js";
import PostPage from "./js/pages/post.js";
import CreatePostPage from "./js/pages/create.js";
import MessagesPage from "./js/pages/messages.js";

const ROUTES = {
  "/": { title: "Home", init: FeedPage },
  "/login": { title: "Login", init: LoginPage },
  "/register": { title: "Register", init: RegisterPage },
  "/logout": { title: "Logout", init: LogoutPage },
  "/create-post": { title: "Create Post", init: CreatePostPage },
  "/messages": { title: "Messages", init: MessagesPage },
  "/post/:id": { title: "Post", init: PostPage },
  404: { title: "Not Found", init: () => {
    document.getElementById("app").innerHTML = `<div class="not-found-page">
  <div class="not-found-code">404</div>
  <h2 class="not-found-title">Page not found</h2>
  <p class="not-found-message">The page you're looking for doesn't exist or may have been moved.</p>
  <a href="#/" class="not-found-btn">Go Home</a>
</div>`;
  }},
};

const AUTH_ONLY = ["/", "/create-post", "/messages", "/post/"];
const GUEST_ONLY = ["/login", "/register"];

function getPath() {
  return window.location.hash.slice(1) || "/";
}

function matchRoute(path) {
  if (ROUTES[path]) return { route: ROUTES[path], params: {} };

  for (const routePath in ROUTES) {
    const rParts = routePath.split("/");
    const pParts = path.split("/");
    if (rParts.length !== pParts.length) continue;

    let matched = true;
    const params = {};
    for (let i = 0; i < rParts.length; i++) {
      if (rParts[i].startsWith(":")) {
        params[rParts[i].slice(1)] = pParts[i];
      } else if (rParts[i] !== pParts[i]) {
        matched = false;
        break;
      }
    }
    if (matched) return { route: ROUTES[routePath], params };
  }

  return { route: ROUTES[404], params: {} };
}

document.body.removeAttribute("unresolved");

if (window.location.pathname !== "/" && window.location.pathname !== "") {
  const path = window.location.pathname + window.location.search;
  window.history.replaceState(null, "", "/"); // clean the visible URL
  window.location.hash = "#" + path;
}

console.log("Current route:", window.location.hash);

on("new_message", (payload) => {
  const path = getPath();
  if (path === "/messages") return;
  const data = payload?.data || payload;
  Banner("New message", `${data.sender_name || "Someone"}: ${data.snippet || data.content || ""}`, "info");
});

on("session_expired", () => {
  Banner("Session expired", "You have been logged out. Please log in again.", "error");
  window.location.hash = "#/login";
});

async function urlLocationHandler() {
  const path = getPath();
  const loggedIn = await CheckSession();

  if (!loggedIn && AUTH_ONLY.some((p) => path === p || (p.length > 1 && path.startsWith(p)))) {
    disconnect();
    window.location.hash = "#/login";
    return;
  }

  if (loggedIn && GUEST_ONLY.includes(path)) {
    window.location.hash = "#/";
    return;
  }

  if (loggedIn) connect();

  const { route, params } = matchRoute(path);
  document.body.classList.remove("auth-page");
  document.getElementById("app").innerHTML = "";

  try {
    if (typeof route.init === "function") await route.init(params);
    document.title = route.title;
  } catch (err) {
    console.error("Failed to render page:", err);
    Banner("Error", "Failed to load the page. Please try again.", "error");
  }
}

window.addEventListener("hashchange", urlLocationHandler);

// Modules are deferred — DOM is already ready when this runs
urlLocationHandler();