import HomePage from "../componentes/home-page.js";
import ChatPage from "../componentes/chat-page.js";
import loginforum from "../componentes/auth/login-forum.js";
import RegisterFrom from "../componentes/auth/register-form.js";
import logout from "../componentes/auth/logout.js";
import PostDetailes from "../componentes/postes/postDeatailes.js";
import CreatePost from "../componentes/postes/create-post.js";

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
