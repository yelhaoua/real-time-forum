import HomePage from "../componentes/home-page.js";
import ChatPage from "../componentes/chat-page.js";
import loginforum from "../componentes/auth/login-forum.js";
import RegisterFrom from "../componentes/auth/register-form.js";
import logout from "../componentes/auth/logout.js";
import PostDetailes from "../componentes/postes/postDeatailes.js";
import CreatePost from "../componentes/postes/create-post.js";
import Messages from "../componentes/messages.js";

export const routes = {
  "/": {
    title: "Home",
    template: "../../templates/feed.html",
    init: HomePage,
  },
  "/register": {
    title: "Register",
    template: "../../index.html",
    init: RegisterFrom,
  },
  "/login": {
    title: "Login",
    template: "../../index.html",

    init: loginforum,
  },
  "/craet-post": {
    title: "Create Post",

    template: "../../templates/creat-post.html",
    init: CreatePost,
  },
  "/logout": {
    title: "Logout",
    template: "../../index.html",

    init: logout,
  },
  "/post/:id": {
    title: "Post Details",
    template: "../../templates/post-details.html",

    init: PostDetailes,
  },
  "/chat-page": {
    title: "Chat",
    template: "../../index.html",
    init: Messages,
  },
  "/chat/:id": {
    title: "Chat",
    template: "../../index.html",
    init: ChatPage,
  },
};
