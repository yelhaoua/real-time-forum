import NotFoundPage from "./js/componentes/not-found.js";
import registerForm from "./js/componentes/register-form.js";
import routes from "./js/routes/routes.js";

const mainPage = document.getElementById("page");

const pathe = window.location.pathname;

console.log(registerForm());
mainPage.innerHTML = routes[pathe] || NotFoundPage();
console.log(mainPage);
