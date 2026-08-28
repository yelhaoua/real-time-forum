import Baner from "./baner.js";

export default function CommentForm(postId) {
  const link = document.createElement("link");

  link.rel = "stylesheet";
  link.href = "../../../assets/styles/creat-post-style.css";

  document.body.addEventListener("submit", async (e) => {
    if (e.target.id == "new-form-comment") {
      document.querySelector(".emoji-btn").disabled = true;
      e.preventDefault();
      let formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());
      console.log("hna1");

      try {
        const req = await fetch(
          `http://localhost:9090/creat-commente/${postId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            credentials: "include",
          },
        );
        const res = await req.json();
        if (!req.ok) {
          Baner(res.error, res.message);
          document.querySelector(".emoji-btn").disabled = false;

          return;
        }

        setTimeout(() => {
          window.location.reload();
        }, 500);
        Baner(res.message);

        console.log(res);
      } catch (error) {
        console.error("Failed to create comment:", error);
        Baner("Error", "Failed to create comment. Please try again later.", "error");

      }
    }
  });

  document.head.appendChild(link);
  let commetesForm = document.createElement("div");
  commetesForm.className = "comment-form-wrap";
  commetesForm.innerHTML = `
    <form id="new-form-comment" class="share-box comment-form-card">
        <div class="share-top">
            <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="User Avatar"
            class="avatar"
            />
            <div class="input-container">
            <div class="input-wrapper">
              <input type="text" name="newcomment" placeholder="New Post Title" />
              <button class="emoji-btn">
                <i class="fa-regular fa-paper-plane"></i>
              </button>
            </div>
            </div>
        </div>
    </form>
    `;

  return commetesForm;
}
