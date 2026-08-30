import { escapeHtml, Banner } from "../ui.js";
import NavBar from "../nav.js";

export default async function PostPage(params) {
  await NavBar();

  const postId = params?.id || window.location.hash.split("/").pop();

  document.getElementById("app").innerHTML = `
    <main id="card-container" class="post-detail-layout">
      <div style="text-align:center;padding:40px;color:var(--muted)">Loading...</div>
    </main>`;

  try {
    const req = await fetch(`http://localhost:9090/post/${postId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const res = await req.json();

    if (!req.ok) {
      Banner(res.error, res.message, "error");
      return;
    }

    const post = res.data;
    const container = document.getElementById("card-container");

    container.innerHTML = `
      <div class="card" data-post-id="${post.post_id}">
        <div class="post-header">
          <div class="post-author">
            <img src="./assets/images/download.jpeg" alt="Author" />
            <div class="author-info">
              <h4>${escapeHtml(post.user_name)}</h4>
              <span>${escapeHtml(post.created_at)}</span>
            </div>
          </div>
          <i class="ri-more-fill" style="color:var(--muted);cursor:pointer"></i>
        </div>
        <div class="post-content">
          <h3>${escapeHtml(post.title)}</h3>
          <p>${escapeHtml(post.content)}</p>
        </div>
        ${post.image_url ? `<img class="post-image" src="${post.image_url}" alt="" />` : ""}
        <div class="post-footer">
          <span class="post-like" data-id="${post.post_id}">
            <i class="${post.is_liked ? "fa-solid" : "fa-regular"} fa-heart" style="${post.is_liked ? "color:var(--accent-red,var(--red));" : ""}"></i>
            <span class="like-count">${post.like_count}</span>
          </span>
          <span class="post-dislike" data-id="${post.post_id}">
            <i class="${post.is_disliked ? "fa-solid" : "fa-regular"} fa-thumbs-down" style="${post.is_disliked ? "color:var(--accent-red,var(--red));" : ""}"></i>
            <span class="dislike-count">${post.dislike_count}</span>
          </span>
          <span class="post-comments" data-id="${post.post_id}">
            <i class="fa-regular fa-comment"></i> ${post.comment_count}
          </span>
        </div>
      </div>

      <div class="comment-form-wrap">
        <form id="new-form-comment" class="share-box comment-form-card">
          <div class="share-top">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Avatar" class="avatar" />
            <div class="input-container">
              <div class="input-wrapper">
                <input type="text" name="newcomment" placeholder="Write a comment..." />
                <button class="emoji-btn" type="submit">
                  <i class="fa-regular fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div id="commentsBox"></div>`;

    // Load existing comments
    loadComments(postId);

    // Handle like/dislike
    container.addEventListener("click", async (e) => {
      const likeBtn = e.target.closest(".post-like");
      if (likeBtn) { await vote(likeBtn.dataset.id, likeBtn, "like"); return; }
      const dislikeBtn = e.target.closest(".post-dislike");
      if (dislikeBtn) { await vote(dislikeBtn.dataset.id, dislikeBtn, "dislike"); return; }
    });

    // Handle comment submit
    document.getElementById("new-form-comment").addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = e.target.querySelector('[name="newcomment"]');
      const text = input.value.trim();
      if (!text) return;

      const submitBtn = e.target.querySelector(".emoji-btn");
      submitBtn.disabled = true;

      try {
        const req = await fetch(`http://localhost:9090/creat-commente/${postId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newcomment: text }),
          credentials: "include",
        });
        const res = await req.json();
        if (!req.ok) {
          Banner(res.error, res.message, "error");
          return;
        }

        // Inject comment into DOM without reload
        input.value = "";
        const commentsBox = document.getElementById("commentsBox");
        commentsBox.insertAdjacentHTML("beforeend", commentHTML({ content: text }));
        Banner("", res.message || "Comment added!", "success");
      } catch (err) {
        console.error("Failed to create comment:", err);
        Banner("Error", "Failed to create comment. Please try again.", "error");
      } finally {
        submitBtn.disabled = false;
      }
    });

  } catch (err) {
    console.error("Failed to load post:", err);
    Banner("Error", "Failed to load post. Please try again.", "error");
  }
}

async function loadComments(postId) {
  try {
    const req = await fetch(`http://localhost:9090/comment/${postId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const res = await req.json();
    const commentsBox = document.getElementById("commentsBox");
    if (!commentsBox) return;

    const comments = res.data || [];
    commentsBox.innerHTML = comments.map(commentHTML).join("");
  } catch (err) {
    console.error("Failed to load comments:", err);
  }
}

function commentHTML(comment) {
  return `
    <div class="single-comment">
      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Avatar" class="avatar" />
      <div class="comment-text-box">
        <p class="comments-body">${escapeHtml(comment.content)}</p>
      </div>
    </div>`;
}

async function vote(postId, btn, action) {
  const isLike = action === "like";
  const iconSel = isLike ? ".fa-heart" : ".fa-thumbs-down";
  const countSel = isLike ? ".like-count" : ".dislike-count";
  const icon = btn.querySelector(iconSel);
  const countSpan = btn.querySelector(countSel);
  if (!icon || !countSpan) return;

  const wasActive = icon.classList.contains("fa-solid");
  const count = parseInt(countSpan.textContent) || 0;

  try {
    const res = await fetch("http://localhost:9090/posts", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, id: Number(postId) }),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) { Banner(result.error || "Error", result.message || "Failed", "error"); return; }

    const activated = result.message === "liked" || result.message === "disliked";
    icon.style.color = activated ? "var(--accent-red, var(--red))" : "";
    icon.classList.toggle("fa-solid", activated);
    icon.classList.toggle("fa-regular", !activated);
    countSpan.textContent = activated ? count + 1 : Math.max(0, count - 1);

    // Clear opposite vote
    const card = btn.closest(".card");
    const oppSel = isLike ? ".post-dislike" : ".post-like";
    const oppIcon = card?.querySelector(isLike ? ".fa-thumbs-down" : ".fa-heart");
    const oppCount = card?.querySelector(isLike ? ".dislike-count" : ".like-count");
    if (activated && oppIcon && oppCount && oppIcon.classList.contains("fa-solid")) {
      oppIcon.style.color = "";
      oppIcon.classList.replace("fa-solid", "fa-regular");
      oppCount.textContent = Math.max(0, (parseInt(oppCount.textContent) || 0) - 1);
    }
  } catch {
    Banner("Error", "Unable to update right now", "error");
  }
}
