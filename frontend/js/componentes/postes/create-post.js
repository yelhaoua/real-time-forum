import NavBar from "../nave-bare.js";
import Baner from "../ui/baner.js";
import CreatePostAction from "./actions/creat-post-action.js";

export default async function CreatePost() {
  NavBar();

  document.getElementById("dynamic_style").href =
    "../../assets/styles/creat-post-style.css";

  const form = document.getElementById("creat-post-form");
  if (!form) return;

  const submitButton = form.querySelector(".action-btn.mention-btn");
  const titleErr = form.querySelector(".title-err");
  const descErr = form.querySelector(".desc-err");
  const imgErr = form.querySelector(".img-err");

  form.onsubmit = async (e) => {
    e.preventDefault();

    if (submitButton) submitButton.disabled = true;
    titleErr.innerHTML = "";
    descErr.innerHTML = "";
    imgErr.innerHTML = "";

    const res = await CreatePostAction(e);
    if (!res || !res.success) {
      if (res?.data?.title_error || res?.data?.desc_error) {
        titleErr.innerHTML = res.data.title_error;
        descErr.innerHTML = res.data.desc_error;
        imgErr.innerHTML = res.data.image_error;
      } else {
        Baner(res?.message || "Unable to create post right now.");
      }
      if (submitButton) submitButton.disabled = false;
      return;
    }

    Baner(res.message);
    form.reset();
    if (submitButton) submitButton.disabled = false;
  };
}
