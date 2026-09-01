import { Banner } from "../ui.js";
import NavBar from "../nav.js";

export default async function CreatePostPage() {
  await NavBar();

  document.getElementById("app").innerHTML = `
    <div style="display:flex;justify-content:center;padding:32px 16px">
      <form id="creat-post-form" method="post" class="share-box create-post-card" style="max-width:640px;width:100%">
        <div class="share-top">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Avatar" class="avatar" />
          <div class="input-container">
            <div class="input-wrapper">
              <input type="text" name="posttitle" minlength="3" maxlength="50" placeholder="New Post Title" />
              <button class="emoji-btn" type="button"><i class="fa-regular fa-face-smile"></i></button>
            </div>
            <div class="title-err"></div>
            <div class="input-wrapper">
              <textarea name="postdesc" minlength="10" maxlength="500" placeholder="New Post Description"></textarea>
            </div>
            <div class="desc-err"></div>
            <div class="input-wrapper">
              <select name="category" required>
                <option value="" disabled selected>Select category</option>
                <option value="sport">Sport</option>
                <option value="games">Games</option>
                <option value="filmes">Filmes</option>
                <option value="kitchen">Kitchen</option>
                <option value="news">News</option>
                <option value="market">Market</option>
                <option value="others">Others</option>
              </select>
            </div>
            <div class="category-err"></div>
          </div>
        </div>
        <hr class="divider" />
        <div class="actions">
          <label class="action-btn image-btn" for="image-upload">
            <i class="fa-regular fa-image"></i> Image
            <input type="file" id="image-upload" name="postimage" accept="image/*" style="display:none" />
          </label>
          <button class="action-btn mention-btn" type="submit">
            <i class="fa-regular fa-paper-plane"></i>
          </button>
        </div>
        <div class="img-err"></div>
      </form>
    </div>`;

  const form = document.getElementById("creat-post-form");
  const submitBtn = form.querySelector(".action-btn.mention-btn");
  const titleErr = form.querySelector(".title-err");
  const descErr = form.querySelector(".desc-err");
  const imgErr = form.querySelector(".img-err");
  const categoryErr = form.querySelector(".category-err");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (form.dataset.submitting === "true") return;
    form.dataset.submitting = "true";
    submitBtn.disabled = true;
    titleErr.innerHTML = "";
    descErr.innerHTML = "";
    imgErr.innerHTML = "";
    categoryErr.innerHTML = "";

    try {
      const req = await fetch("http://localhost:9090/craet-post", {
        method: "POST",
        body: new FormData(form),
        credentials: "include",
      });
      const res = await req.json();

      if (!req.ok || !res.success) {
        if (res?.data?.title_error || res?.data?.desc_error || res?.data?.cate_error) {
          titleErr.innerHTML = res.data.title_error || "";
          descErr.innerHTML = res.data.desc_error || "";
          imgErr.innerHTML = res.data.image_error || "";
          categoryErr.innerHTML = res.data.cate_error || "";
        } else {
          Banner("Error", res?.message || "Unable to create post right now.", "error");
        }
        return;
      }

      Banner("", res.message || "Post created!", "success");
      form.reset();
    } catch (err) {
      console.error("Failed to create post:", err);
      Banner("Error", "Failed to create post. Please try again.", "error");
    } finally {
      form.dataset.submitting = "false";
      submitBtn.disabled = false;
    }
  });
}
