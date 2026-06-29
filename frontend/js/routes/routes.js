import Heloo from "../componentes/heloo.js";
import HomePage from "../componentes/home-page.js";
import registerForm from "../componentes/register-form.js";
import loginforum from "../componentes/login-forum.js";
import CreatePost from "../componentes/create-post.js";

const routes = {
  "/": HomePage,
  "/register": registerForm,
  "/login": loginforum,
  "/craet-post": CreatePost,
};

export default routes;
