import HomePage from "../componentes/home-page.js";
import ChatPage from "../componentes/chat-page.js";
import loginforum from "../componentes/auth/login-forum.js";
import RegisterFrom from "../componentes/auth/register-form.js";
import logout from "../componentes/auth/logout.js";
import CreatePost from "../postes/create-post.js";
import PostDetailes from "../postes/postDeatailes.js";

const routes = {
  "/": HomePage,
  "/register": RegisterFrom,
  "/login": loginforum,
  "/craet-post": CreatePost,
  "/logout": logout,
  "/post/:id": PostDetailes,
  "/chat/:id": ChatPage,
};

export default routes;
