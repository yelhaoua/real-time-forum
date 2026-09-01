import escapeHTML from "../../shared/formate-text.js";
import NavBar from "../nave-bare.js";

function clearOppositeVote(
  btnElement,
  oppositeSelector,
  iconClass,
  countClass,
) {
  const card = btnElement.closest(
    ".feed-card, .post-detail-page, #card-container",
  );
  const oppositeBtn = card && card.querySelector(oppositeSelector);
  if (!oppositeBtn) return;

  const icon = oppositeBtn.querySelector(iconClass);
  const countSpan = oppositeBtn.querySelector(countClass);
  if (!icon || !countSpan) return;

  if (icon.classList.contains("fa-solid")) {
    icon.style.color = "";
    icon.classList.remove("fa-solid");
    icon.classList.add("fa-regular");
    countSpan.textContent = Math.max(
      0,
      (parseInt(countSpan.textContent) || 0) - 1,
    );
  }
}

async function ToggleLike(postId, likeBtnElement) {
  const icon = likeBtnElement.querySelector(".fa-heart");
  const countSpan = likeBtnElement.querySelector(".like-count");

  if (!icon || !countSpan) return;

  const isCurrentlyLiked = icon.classList.contains("fa-solid");
  let currentCount = parseInt(countSpan.textContent) || 0;

  try {
    const res = await fetch("http://localhost:9090/posts", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "like",
        id: Number(postId),
      }),
    });

    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
      Baner(result.error || "request_error", result.message || "Action failed");
      return;
    }

    if (result.message === "liked") {
      icon.style.color = "var(--accent-red)";
      icon.classList.remove("fa-regular");
      icon.classList.add("fa-solid");
      countSpan.textContent = currentCount + 1;
      clearOppositeVote(
        likeBtnElement,
        ".post-dislike",
        ".fa-thumbs-down",
        ".dislike-count",
      );
    } else if (result.message === "unliked") {
      icon.style.color = "";
      icon.classList.remove("fa-solid");
      icon.classList.add("fa-regular");
      countSpan.textContent = Math.max(0, currentCount - 1);
    }
  } catch (error) {
    Baner("request_error", "Unable to update like state right now");
    icon.style.color = isCurrentlyLiked ? "var(--accent-red)" : "";
    icon.classList.toggle("fa-solid", isCurrentlyLiked);
    icon.classList.toggle("fa-regular", !isCurrentlyLiked);
    countSpan.textContent = currentCount;
  }
}

async function ToggleDislike(postId, dislikeBtnElement) {
  const icon = dislikeBtnElement.querySelector(".fa-thumbs-down");
  const countSpan = dislikeBtnElement.querySelector(".dislike-count");

  if (!icon || !countSpan) return;

  const isCurrentlyDisliked = icon.classList.contains("fa-solid");
  let currentCount = parseInt(countSpan.textContent) || 0;

  try {
    const res = await fetch("http://localhost:9090/posts", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "dislike",
        id: Number(postId),
      }),
    });

    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
      Baner(result.error || "request_error", result.message || "Action failed");
      return;
    }

    if (result.message === "disliked") {
      icon.style.color = "var(--accent-red)";
      icon.classList.remove("fa-regular");
      icon.classList.add("fa-solid");
      countSpan.textContent = currentCount + 1;
      clearOppositeVote(
        dislikeBtnElement,
        ".post-like",
        ".fa-heart",
        ".like-count",
      );
    } else if (result.message === "undisliked") {
      icon.style.color = "";
      icon.classList.remove("fa-solid");
      icon.classList.add("fa-regular");
      countSpan.textContent = Math.max(0, currentCount - 1);
    }
  } catch (error) {
    Baner("request_error", "Unable to update dislike state right now");
    icon.style.color = isCurrentlyDisliked ? "var(--accent-red)" : "";
    icon.classList.toggle("fa-solid", isCurrentlyDisliked);
    icon.classList.toggle("fa-regular", !isCurrentlyDisliked);
    countSpan.textContent = currentCount;
  }
}

if (typeof window !== "undefined") {
  window.ToggleLike = ToggleLike;
  window.ToggleDislike = ToggleDislike;
  window.HandlePostActions = HandlePostActions;
}

async function HandlePostActions(e) {
  console.log(e);

  const likeBtn = e.target.closest(".post-like");

  if (likeBtn) {
    const postId = likeBtn.dataset.id;
    await ToggleLike(postId, likeBtn);
    return;
  }

  const dislikeBtn = e.target.closest(".post-dislike");

  if (dislikeBtn) {
    const postId = dislikeBtn.dataset.id;
    await ToggleDislike(postId, dislikeBtn);
    return;
  }

  const commentBtn = e.target.closest(".post-comments");
  async function isLoggedIn() {
    try {
      const res = await fetch("http://localhost:9090/checksession", {
        method: "GET",
        credentials: "include",
      });
      return res.ok;
    } catch (e) {
      console.error("Failed to check session:", e);
      Baner("Error", "Failed to check session. Please try again later.", "error");
      return false;
    }
  }

  if (commentBtn) {
    const postId = commentBtn.dataset.id;
    console.log("Comments:", postId);
    if (await isLoggedIn()) {
      window.location.hash = `/post/${postId}`;
    } else {
      window.location.hash = "/login";
    }
    return;
  }

  if (e.target.closest(".ri-more-fill")) return;

  const card = e.target.closest(".feed-card");
  if (card) {
    if (await isLoggedIn()) {
      window.location.hash = `/post/${card.dataset.postId}`;
    } else {
      window.location.hash = "/login";
    }
  }
}

async function loadPosts() {
  if (typeof POSTS_LIMIT === "undefined") return;
  if (POSTS_LOADING || POSTS_ALL_LOADED) return;
  POSTS_LOADING = true;

  try {
    const res = await fetch(
      `http://localhost:9090/posts?limit=${POSTS_LIMIT}&offset=${POSTS_OFFSET}`,
      {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      },
    );
    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
      Baner(
        result.error || "request_error",
        result.message || "Failed to load posts",
      );
      POSTS_LOADING = false;
      return;
    }

    const posts = result.data?.all_posts || [];
    if (!posts.length) POSTS_ALL_LOADED = true;

    const cardContainer = document.querySelector(".card-container");
    if (!cardContainer) return;

    const postsHTML = posts
      .map(
        (post) => `
        <article class="card feed-card" data-post-id="${post.id}">
            <div class="post-header">
              <div class="post-author">
                <img src="./assets/images/download.jpeg" alt="Author" />
                <div class="author-info">
                  <h4>${post.user_name}</h4>
                  <span>${post.creat_at} - ${post.category_name ? `<span class="post-category">${escapeHTML(post.category_name)}</span>` : ""}</span>
                  
                </div>
              </div>
              <i class="ri-more-fill" style="color: var(--text-muted); cursor: pointer"></i>
            </div>
            <div class="post-content">
              <h3> ${escapeHTML(post.title)} </h3>
              <p> ${escapeHTML(post.content)}</p>
            </div>
              ${post.image_url ? '<img class="post-image" src="' + post.image_url + '" alt=""/>' : ""}
              <div class="post-footer">
                <span class="post-like" data-id="${post.id}">
                  <i class="${post.is_like ? "fa-solid" : "fa-regular"} fa-heart" style="${post.is_like ? "color: var(--accent-red);" : ""}"></i>
                  <span class="like-count">${post.like_count}</span>
                </span>
                <span class="post-dislike" data-id="${post.id}">
                  <i class="${post.is_dislike ? "fa-solid" : "fa-regular"} fa-thumbs-down" style="${post.is_dislike ? "color: var(--accent-red);" : ""}"></i>
                  <span class="dislike-count">${post.dislike_count}</span>
                </span>
                <span class="post-comments" data-id="${post.id}">
                  <i class="fa-regular fa-comment"></i>
                  <span class="comment-count">${post.comment_count}</span>
                </span>
              </div>
        </article>
      `,
      )
      .join("");

    if (POSTS_OFFSET === 0) cardContainer.innerHTML = postsHTML;
    else cardContainer.insertAdjacentHTML("beforeend", postsHTML);

    if (!cardContainer._hasClickHandler) {
      cardContainer.addEventListener("click", HandlePostActions);
      cardContainer._hasClickHandler = true;
    }

    POSTS_OFFSET += posts.length;
  } catch (err) {
    console.error("Failed to fetch posts", err);
  } finally {
    POSTS_LOADING = false;
  }
}

export default async function FeedPage() {
  document.getElementById("dynamic_style").href =
    "../../assets/styles/main-style.css";



  await NavBar();

  window.POSTS_OFFSET = 0;
  window.POSTS_LIMIT = 10;
  window.POSTS_LOADING = false;
  window.POSTS_ALL_LOADED = false;

  await loadPosts();

  const cardContainer = document.querySelector(".card-container");
  if (!cardContainer) return;

  let sentinel = document.getElementById("feed-sentinel");
  if (!sentinel) {
    sentinel = document.createElement("div");
    sentinel.id = "feed-sentinel";
    sentinel.style.padding = "1px";
    cardContainer.appendChild(sentinel);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !POSTS_LOADING && !POSTS_ALL_LOADED) {
          loadPosts();
        }
      });
    },
    { root: null, rootMargin: "400px", threshold: 0.1 },
  );

  observer.observe(sentinel);
}
