import Baner from "./ui/baner.js";

export default function PostDetailes() {
  let link = window.location.href;
  link = link.split("/");
  const postId = link[link.length - 1];
  console.log(postId);

  const getPostDetailes = async () => {
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
      console.log(res);
    } catch (error) {}
  };
  getPostDetailes();
  return `<h1>Helooo</h1>`;
}
