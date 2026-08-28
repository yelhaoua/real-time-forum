import { routes } from "./js/routes/routes.js";
import { connect, disconnect, on } from "./js/shared/ws-provider.js";
import Baner from "./js/componentes/ui/baner.js";

const getPath = () => {
  const hash = window.location.hash.slice(1);
  return hash || "/";
};

const matchRoute = (path) => {
  if (routes[path]) {
    return {
      route: routes[path],
      params: {},
    };
  }

  for (const routePath in routes) {
    const routeParts = routePath.split("/");
    const pathParts = path.split("/");

    if (routeParts.length !== pathParts.length) continue;

    let matched = true;
    const params = {};

    for (let i = 0; i < routeParts.length; i++) {
      const routePart = routeParts[i];
      const pathPart = pathParts[i];

      if (routePart.startsWith(":")) {
        params[routePart.slice(1)] = pathPart;
      } else if (routePart !== pathPart) {
        matched = false;
        break;
      }
    }

    if (matched) {
      return {
        route: routes[routePath],
        params,
      };
    }
  }

  return {
    route: routes[404],
    params: {},
  };
};

async function isLoggedIn() {
  try {
    const req = await fetch("http://localhost:9090/checksession", {
      method: "GET",
      credentials: "include",
    });
    return req.ok;
  } catch {
    return false;
  }
}

const AUTH_ONLY = ["/", "/craet-post", "/chat-page", "/chat/:id"];
const GUEST_ONLY = ["/login", "/register"];

const urlLocationHandler = async () => {
  const location = getPath();
  const loggedIn = await isLoggedIn();

  if (
    !loggedIn &&
    AUTH_ONLY.some(
      (p) =>
        location === p ||
        (p.includes(":") && location.startsWith(p.split(":")[0])),
    )
  ) {
    disconnect();
    window.location.hash = "#/login";
    return;
  }

  if (loggedIn && GUEST_ONLY.includes(location)) {
    window.location.hash = "#/";
    return;
  }

  if (loggedIn) connect();

  if (loggedIn) {
    on("new_message", (payload) => {
      try {
        const currentPath = getPath();

        // Suppress notifications on any chat route
        if (currentPath === "/chat-page" || currentPath.startsWith("/chat/")) {
          return;
        }

        const data = payload?.data || payload;
        Baner(
          "New message",
          `${data.sender_name || "Someone"}: ${data.snippet || ""}`,
          "info",
        );
      } catch (e) {
        console.error("Error handling new_message event:", e);
        Baner("Error", "Failed to display new message.", "error");
      }
    });
  }

  const { route, params } = matchRoute(location);

  try {
    const response = await fetch(route.template);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - Template not found`);
    }

    const html = await response.text();

    document.getElementById("app").innerHTML = html;

    if (typeof route.init === "function") {
      await route.init(params);
    }

    document.title = route.title;
  } catch (err) {
    console.error("Failed to render page route:", err);
    Baner("Error", "Failed to load the page. Please try again later.", "error");
  }
};

window.addEventListener("click", (e) => {
  const anchor = e.target.closest("a");

  if (!anchor) return;

  const href = anchor.getAttribute("href");

  if (!href) return;

  if (href.startsWith("#/")) {
    e.preventDefault();
    window.location.hash = href;
  }

  if (href === "/logout") {
    e.preventDefault();
    window.location.hash = "#/logout";
  }
});

window.addEventListener("hashchange", urlLocationHandler);

window.addEventListener("DOMContentLoaded", urlLocationHandler);
