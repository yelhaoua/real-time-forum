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

      const formData = new FormData(e.target);
      console.log(formData.entries());

      const data = Object.fromEntries(formData.entries());
      console.log(data);

      try {
        const req = await fetch("http://localhost:9000/craet-post", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const res = await req.json();
        let baner = document.getElementById("succes-Message");

        if (!req.ok) {
          if (baner) {
            baner.remove();
          }
          document.body.appendChild(Baner(res.Message, res.Message));
        }
        if (baner) {
          baner.remove();
        }
        document.body.appendChild(Baner(res.Message, res.Message));
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
          <div class="input-wrapper">
            <input type="text" name="newpost" placeholder="Share something..." />
            <button class="emoji-btn">
              <i class="fa-regular fa-face-smile"></i>
            </button>
          </div>
        </div>

        <hr class="divider" />

        <div class="actions">
          <label class="action-btn image-btn" for="image-upload">
            <i class="fa-regular fa-image"></i> Image
            <input
              type="file"
              id="image-upload"
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
