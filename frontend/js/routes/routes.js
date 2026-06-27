import Heloo from "../componentes/heloo.js";
import HomePage from "../componentes/home-page.js";
import registerForm from "../componentes/register-form.js";
import loginforum from "../componentes/login-forum.js";

const routes = {
  "/": HomePage,
  "/helooo": Heloo,
  "/register": registerForm,
  "/login": loginforum,
};

export default routes;
