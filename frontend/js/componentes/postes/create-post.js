import NavBar from "../nave-bare.js";
import Baner from "../ui/baner.js";
import MainHeaders from "../../shared/main-headers.js";

export default function CreatePost() {
  MainHeaders();
  NavBar();

  let link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "../../assets/styles/creat-post-style.css";
  document.head.appendChild(link);

  document.body.addEventListener("submit", async (e) => {
    let title_err = document.querySelector(".title-err");
    let desc_err = document.querySelector(".desc-err");
    let img_err = document.querySelector(".img-err");
    title_err.innerHTML = "";
    desc_err.innerHTML = "";
    img_err.innerHTML = "";
    if (e.target.id === "creat-post-form") {
      e.preventDefault();
      let formData = new FormData(e.target);

      try {
        const req = await fetch("http://localhost:9090/craet-post", {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        const res = await req.json();

        if (!req.ok) {
          console.log(res);

          if (res.data.title_error || res.data.desc_error || res.data) {
            title_err.innerHTML = res.data.title_error;
            desc_err.innerHTML = res.data.desc_error;
            img_err.innerHTML = res.data.image_error;
            return;
          }
          Baner(res.error, res.message);
          return;
        }
        Baner(res.message);
      } catch (error) {
        console.log(error);

        Baner("server errore", "backend server ius down pleas try agin layter");
      }
    }
  });
  return `
    <form action="" id="creat-post-form" class="share-box create-post-card">
        <div class="share-top">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="User Avatar"
            class="avatar"
          />
          <div class="input-container">
            <div class="input-wrapper">
              <input type="text" name="posttitle" placeholder="New Post Title" />
              <button class="emoji-btn">
                <i class="fa-regular fa-face-smile"></i>
              </button>
            </div>
            <div class="title-err"></div>
            <div class="input-wrapper">
              <textarea name="postdesc"  placeholder="New Post Description"></textarea>
            </div>
            <div class="desc-err"><div>
          </div>
        </div>

        <hr class="divider" />

        <div class="actions">
          <label class="action-btn image-btn" for="image-upload">
            <i class="fa-regular fa-image"></i> Image
            <input
              type="file"
              id="image-upload"
              name="postimage"
              accept="image/*"
              name="imagepost"
              style="display: none"
            />
          </label>
          

          <button class="action-btn mention-btn" type="submit">
            <i class="fa-regular fa-paper-plane"></i>
          </button>
        </div>
        <div class="img-err"></div>
    </form>
    `;
}
