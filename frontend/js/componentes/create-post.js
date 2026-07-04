import Baner from "./ui/baner.js";

export default function CreatePost() {
  let styleLink = document.createElement("link");
  styleLink.rel = "stylesheet";
  styleLink.href = "../../assets/styles/creat-post-style.css";
  document.head.appendChild(styleLink);

  document.body.addEventListener("submit", async (e) => {
    console.log();
    e.preventDefault();
    console.log(e.target);

    if (e.target.id === "creat-post-form") {
      e.preventDefault();
      e.stopPropagation();
      console.log(e.target.id);

      let formData = new FormData(e.target);

      try {
        const req = await fetch("http://localhost:9090/craet-post", {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        const res = await req.json();

        if (!req.ok) {
          Baner(res.error, res.message);
          return;
        }

        Baner(res.error, res.message);
      } catch (error) {
        let baner = document.getElementById("succes-Message");
        if (baner) {
          baner.remove();
        }
        document.body.appendChild(
          Baner(
            "server errore",
            "backend server ius down pleas try agin layter",
          ),
        );
      }
    }
  });
  return `
    <form action=""  id="creat-post-form">
      <div class="share-box">
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
            <div class="input-wrapper">
              <textarea name="postdesc"  placeholder="New Post Description"></textarea>
            </div>
          <div>
           
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

          <button  class="action-btn mention-btn" type="submit">
            <i class="fa-regular fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </form>
    
    
    `;
}
