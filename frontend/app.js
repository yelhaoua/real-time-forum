import NotFoundPage from "./js/componentes/not-found.js";
import routes from "./js/routes/routes.js";

function router() {
  const page = document.getElementById("app");
  const pathe = window.location.pathname;
  let renderComponente;
  if (
    pathe === "/frontend/" ||
    pathe === "/frontend/index.html" ||
    pathe === "/index.html" ||
    pathe === ""
  ) {
    renderComponente = routes["/"];
  } else {
    renderComponente = routes[pathe] || NotFoundPage;
  }
  page.innerHTML = renderComponente();
}

function navigate(url) {
  window.history.pushState({}, "", url);
  router();
}

document.addEventListener("click", (e) => {
  if (e.target.matches(".nav-link")) {
    e.preventDefault();
    navigate(e.target.getAttribute("href"));
  }
});

window.addEventListener("popstate", router);
window.addEventListener("DOMContentLoaded", router);
