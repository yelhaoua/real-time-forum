import HomePage from "../componentes/home-page.js";

import CreatePost from "../componentes/create-post.js";

import PostDetailes from "../componentes/postDeatailes.js";

import ChatPage from "../componentes/chat-page.js";
import loginforum from "../auth/login-forum.js";
import RegisterForm from "../auth/register-form.js";
import logout from "../auth/logout.js";

const routes = {
  "/": HomePage,
  "/register": RegisterForm,
  "/login": loginforum,
  "/craet-post": CreatePost,
  "/logout": logout,
  "/post/:id": PostDetailes,
  "/chat/:id": ChatPage,
};

export default routes;
