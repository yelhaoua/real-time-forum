import MainHeaders from "../shared/main-headers.js";
import Comments from "./comments.js";
import NavBar from "./nave-bare.js";
import CommentForm from "./ui/add-commente.js";
import Baner from "./ui/baner.js";
import CardPost from "./ui/card-post.js";
import CommentsBox from "./ui/commentsBox.js";

export default function PostDetailes() {
  MainHeaders();
  NavBar();

  let linkStyle = document.createElement("link");
  linkStyle.rel = "stylesheet";
  linkStyle.href = "../../assets/styles/main-style.css";
  document.head.appendChild(linkStyle);

  document;
  let link = window.location.href;
  link = link.split("/");
  const postId = link[link.length - 1];
  console.log(postId);

  const getPostDetailes = async () => {
    let postInfo;
    try {
      const req = await fetch(`http://localhost:9090/post/${postId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const res = await req.json();
      if (!req.ok) {
        Baner(res.error || "Error", res.message || "Something went wrong");
        return;
      }
      postInfo = res;
      if (postInfo) {
        const container = document.getElementById("card-container");
        container.classList.add("post-detail-page");
        container.appendChild(CardPost(postInfo.data));
        container.appendChild(CommentForm(postInfo.data.post_id));
        CommentsBox();
        let comentesElemente = document.querySelector(".post-comments");
        container.addEventListener("click", window.HandlePostActions);
        getCommetes(postId);
      } else {
        document.getElementById("card-container").innerHTML = `any post found`;
      }
    } catch (error) {}
  };

  getPostDetailes();

  async function getCommetes(id) {
    try {
      const req = await fetch(`http://localhost:9090/comment/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const res = await req.json();

      if (!req.ok) {
        Baner(res.error, res.message);
        return;
      }

      Comments(res);
    } catch (error) {}
  }

  return `<main id="card-container" class="post-detail-layout"></main>`;
}
