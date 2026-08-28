import NavBar from "../nave-bare.js";
import Baner from "../ui/baner.js";
import CreatePostAction from "./actions/creat-post-action.js";

export default async function CreatePost() {
  NavBar();

  document.getElementById("dynamic_style").href =
    "../../assets/styles/creat-post-style.css";

  document.body.addEventListener("submit", async (e) => {
    document.querySelector(".action-btn").disabled = true;

    let title_err = document.querySelector(".title-err");
    let desc_err = document.querySelector(".desc-err");
    let img_err = document.querySelector(".img-err");
    title_err.innerHTML = "";
    desc_err.innerHTML = "";
    img_err.innerHTML = "";
    if (e.target.id === "creat-post-form") {
      const res = await CreatePostAction(e);
      if (!res.success) {
        if (res.data?.title_error || res.data?.desc_error) {
          title_err.innerHTML = res.data.title_error;
          desc_err.innerHTML = res.data.desc_error;
          img_err.innerHTML = res.data.image_error;
          return;
        }
        Baner(res.message);
        return;
      }
      Baner(res.message);
    }
  });
}
