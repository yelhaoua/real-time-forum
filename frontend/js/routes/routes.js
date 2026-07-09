import HomePage from "../componentes/home-page.js";
import registerForm from "../componentes/register-form.js";
import loginforum from "../componentes/login-forum.js";
import CreatePost from "../componentes/create-post.js";
import Logout from "../componentes/logout.js";
import PostDetailes from "../componentes/postDeatailes.js";

import ChatPage from "../componentes/chat-page.js";

const routes = {
  "/": HomePage,
  "/register": registerForm,
  "/login": loginforum,
  "/craet-post": CreatePost,
  "/logout": Logout,
  "/post/:id": PostDetailes,
  "/chat/:id": ChatPage,

};

export default routes;
