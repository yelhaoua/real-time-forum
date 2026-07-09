import NavBar from "./js/componentes/nave-bare.js";
import NotFoundPage from "./js/componentes/not-found.js";
import routes from "./js/routes/routes.js";

function matchRoute(pathname) {
  for (const route in routes) {
    const routeParts = route.split("/");
    const pathParts = pathname.split("/");

    if (routeParts.length !== pathParts.length) continue;
    let params = {};
    let matched = true;

    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(":")) {
        params[routeParts[i].slice(1)] = pathParts[i];
      } else if (routeParts[i] !== pathParts[i]) {
        matched = false;
        break;
      }
    }

    if (matched) {
      return {
        component: routes[route],
        params,
      };
    }
  }

  return null;
}
function router() {
  const page = document.getElementById("app");

  const currentHash = window.location.hash || "#/";
  const cleanPath = currentHash.replace("#", "");

  const match = matchRoute(cleanPath);

  if (!match) {
    page.innerHTML = NotFoundPage();
    return;
  }
  page.innerHTML = match.component(match.params);
}

window.addEventListener("hashchange", router);

window.addEventListener("DOMContentLoaded", router);

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}
