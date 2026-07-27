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
    style: "",
    template: "../../index.html",
    init: HomePage,
  },
  "/register": {
    title: "Register",
    style: "",
    template: "../../../index.html",
    init: RegisterFrom,
  },
  "/login": {
    title: "Login",
    style: "",
    template: "../../../index.html",

    init: loginforum,
  },
  "/create-post": {
    title: "Create Post",
    style: "",
    template: "../../../index.html",

    init: CreatePost,
  },
  "/logout": {
    title: "Logout",
    style: "",
    template: "../../../index.html",

    init: logout,
  },
  "/post/:id": {
    title: "Post Details",
    style: "",
    template: "../../../index.html",

    init: PostDetailes,
  },
  "/chat-page": {
    title: "Chat",
    style: "",
    template: "../../../index.html",
    init: Messages,
  },
  "/chat/:id": {
    title: "Chat",
    style: "",
    template: "../../../index.html",
    init: ChatPage,
  },
};
