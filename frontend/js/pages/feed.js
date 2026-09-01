import { escapeHtml, Banner } from "../ui.js";
import NavBar from "../nav.js";

const LIMIT = 10;
let offset = 0;
let loading = false;
let allLoaded = false;

function clearOppositeVote(btn, oppositeSelector, iconClass, countClass) {
  const card = btn.closest(".feed-card, #card-container");
  const oppBtn = card?.querySelector(oppositeSelector);
  if (!oppBtn) return;
  const icon = oppBtn.querySelector(iconClass);
  const count = oppBtn.querySelector(countClass);
  if (!icon || !count) return;
  if (icon.classList.contains("fa-solid")) {
    icon.style.color = "";
    icon.classList.replace("fa-solid", "fa-regular");
    count.textContent = Math.max(0, (parseInt(count.textContent) || 0) - 1);
  }
}

async function toggleVote(postId, btn, action) {
  const isLike = action === "like";
  const iconClass = isLike ? ".fa-heart" : ".fa-thumbs-down";
  const countClass = isLike ? ".like-count" : ".dislike-count";
  const icon = btn.querySelector(iconClass);
  const countSpan = btn.querySelector(countClass);
  if (!icon || !countSpan) return;

  const wasActive = icon.classList.contains("fa-solid");
  const currentCount = parseInt(countSpan.textContent) || 0;

  try {
    const res = await fetch("http://localhost:9090/posts", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, id: Number(postId) }),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      Banner(result.error || "request_error", result.message || "Action failed", "error");
      return;
    }

    const activated = result.message === "liked" || result.message === "disliked";
    if (activated) {
      icon.style.color = "var(--accent-red, var(--red))";
      icon.classList.replace("fa-regular", "fa-solid");
      countSpan.textContent = currentCount + 1;
      clearOppositeVote(
        btn,
        isLike ? ".post-dislike" : ".post-like",
        isLike ? ".fa-thumbs-down" : ".fa-heart",
        isLike ? ".dislike-count" : ".like-count",
      );
    } else {
      icon.style.color = "";
      icon.classList.replace("fa-solid", "fa-regular");
      countSpan.textContent = Math.max(0, currentCount - 1);
    }
  } catch {
    icon.style.color = wasActive ? "var(--accent-red, var(--red))" : "";
    icon.classList.toggle("fa-solid", wasActive);
    icon.classList.toggle("fa-regular", !wasActive);
    countSpan.textContent = currentCount;
    Banner("request_error", "Unable to update right now", "error");
  }
}

async function handlePostClick(e) {
  const likeBtn = e.target.closest(".post-like");
  if (likeBtn) { await toggleVote(likeBtn.dataset.id, likeBtn, "like"); return; }

  const dislikeBtn = e.target.closest(".post-dislike");
  if (dislikeBtn) { await toggleVote(dislikeBtn.dataset.id, dislikeBtn, "dislike"); return; }

  if (e.target.closest(".ri-more-fill")) return;

  const commentBtn = e.target.closest(".post-comments");
  const card = e.target.closest(".feed-card");
  const postId = commentBtn?.dataset?.id || card?.dataset?.postId;
  if (postId) window.location.hash = `#/post/${postId}`;
}

function postHTML(post) {
  return `
    <article class="card feed-card" data-post-id="${post.id}">
      <div class="post-header">
        <div class="post-author">
          <img src="./assets/images/download.jpeg" alt="Author" />
          <div class="author-info">
            <h4>${escapeHtml(post.user_name)}</h4>
            <span>${escapeHtml(post.creat_at)} - ${post.category_name ? `<span class="post-category">${escapeHtml(post.category_name)}</span>` : ""}</span>
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
        <span class="post-like" data-id="${post.id}">
          <i class="${post.is_like ? "fa-solid" : "fa-regular"} fa-heart" style="${post.is_like ? "color:var(--accent-red,var(--red));" : ""}"></i>
          <span class="like-count">${post.like_count}</span>
        </span>
        <span class="post-dislike" data-id="${post.id}">
          <i class="${post.is_dislike ? "fa-solid" : "fa-regular"} fa-thumbs-down" style="${post.is_dislike ? "color:var(--accent-red,var(--red));" : ""}"></i>
          <span class="dislike-count">${post.dislike_count}</span>
        </span>
        <span class="post-comments" data-id="${post.id}">
          <i class="fa-regular fa-comment"></i>
          <span class="comment-count">${post.comment_count}</span>
        </span>
      </div>
    </article>`;
}

async function loadPosts() {
  if (loading || allLoaded) return;
  loading = true;

  try {
    const res = await fetch(`http://localhost:9090/posts?limit=${LIMIT}&offset=${offset}`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      Banner(result.error || "request_error", result.message || "Failed to load posts", "error");
      return;
    }

    const posts = result.data?.all_posts || [];
    if (posts.length < LIMIT) allLoaded = true;

    const container = document.querySelector(".card-container");
    if (!container) return;

    const html = posts.map(postHTML).join("");
    if (offset === 0) container.innerHTML = html;
    else container.insertAdjacentHTML("beforeend", html);

    if (!container._clickBound) {
      container.addEventListener("click", handlePostClick);
      container._clickBound = true;
    }

    offset += posts.length;
  } catch (err) {
    console.error("Failed to fetch posts:", err);
  } finally {
    loading = false;
  }
}

export default async function FeedPage() {
  offset = 0;
  loading = false;
  allLoaded = false;

  await NavBar();

  document.getElementById("app").innerHTML = `
    <main class="feed-layout">
      <div class="card-container"></div>
    </main>`;

  await loadPosts();

  const container = document.querySelector(".card-container");
  if (!container) return;

  const sentinel = document.createElement("div");
  sentinel.id = "feed-sentinel";
  sentinel.style.padding = "1px";
  container.appendChild(sentinel);

  new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) loadPosts(); }),
    { rootMargin: "400px", threshold: 0.1 },
  ).observe(sentinel);
}
