import CheckSession from "../../shared/checkSession.js";
import MainHeaders from "../../shared/main-headers.js";
import PostesDetailesAction, {
  GetCommetesAction,
} from "./actions/post-details-action.js";
import Comments from "../comments.js";
import Baner from "../ui/baner.js";
import CommentForm from "../ui/add-commente.js";
import NavBar from "../nave-bare.js";
import CardPost from "../ui/card-post.js";
import CommentsBox from "../ui/commentsBox.js";

export default function PostDetailes() {
  MainHeaders();
  NavBar();

  let linkStyle = document.createElement("link");
  linkStyle.rel = "stylesheet";
  linkStyle.href = "../../assets/styles/main-style.css";
  document.head.appendChild(linkStyle);

  let link = window.location.href;
  link = link.split("/");
  const postId = link[link.length - 1];

  (async () => {
    // await CheckSession();
    const res = await PostesDetailesAction(postId);
    console.log("hnaaa", res);

    if (!res.success) {
      Baner(res.error, res.message);
      return;
    } else {
      if (res.data) {
        const container = document.getElementById("card-container");
        container.classList.add("post-detail-page");
        container.appendChild(CardPost(res?.data));
        container.appendChild(CommentForm(res.data.post_id));
        CommentsBox();
        let comentesElemente = document.querySelector(".post-comments");
        container.addEventListener("click", window.HandlePostActions);

        const rescomments = await GetCommetesAction(postId);
        Comments(rescomments);
      } else {
        document.getElementById("card-container").innerHTML = `any post found`;
      }
    }
  })();

  return `<main id="card-container" class="post-detail-layout"></main>`;
}
