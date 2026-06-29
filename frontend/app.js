import NavBar from "./js/componentes/nave-bare.js";
import NotFoundPage from "./js/componentes/not-found.js";
import routes from "./js/routes/routes.js";

function router() {
  const page = document.getElementById("app");

  const currentHash = window.location.hash || "#/";

  const cleanPath = currentHash.replace("#", "");
  const renderComponente = routes[cleanPath] || NotFoundPage;

  page.innerHTML = renderComponente();
}

window.addEventListener("hashchange", router);

window.addEventListener("DOMContentLoaded", router);
