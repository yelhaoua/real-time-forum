import Baner from "./ui/baner.js";
import CardPost from "./ui/card-post.js";

export default function PostDetailes() {
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
        document.getElementById("card-container").innerHTML = CardPost(
          postInfo.data,
        );

        let comentesElemente = document.querySelector(".post-comments");
        comentesElemente.addEventListener("click", () => {
          getCommetes(comentesElemente.dataset.id);
        });
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

      console.log(res);
    } catch (error) {}
  }

  return `<div id="card-container"></div>`;
}
