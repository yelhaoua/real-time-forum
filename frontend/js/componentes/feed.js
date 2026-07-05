import NavBar from "./nave-bare.js";
import Baner from "./ui/baner.js";
async function toggleLike(postId, likeBtnElement) {
  const icon = likeBtnElement.querySelector(".fa-heart");
  const countSpan = likeBtnElement.querySelector(".like-count");

  if (!icon || !countSpan) return;

  // 1. OPTIMISTIC UPDATE: Read current state and change UI instantly
  const isCurrentlyLiked = icon.classList.contains("fa-solid");
  let currentCount = parseInt(countSpan.textContent) || 0;

  if (isCurrentlyLiked) {
    // Optimistically UNLIKE
    icon.style.color = "";
    icon.classList.remove("fa-solid");
    icon.classList.add("fa-regular");
    countSpan.textContent = Math.max(0, currentCount - 1); // Decrement count (-1)
  } else {
    // Optimistically LIKE
    icon.style.color = "var(--accent-red)";
    icon.classList.remove("fa-regular");
    icon.classList.add("fa-solid");
    countSpan.textContent = currentCount + 1; // Increment count (+1)
  }

  try {
    // 2. Send the background request to Go server
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

    const result = await res.json();

    if (result.message === "liked") {
      icon.style.color = "var(--accent-red)";
      icon.classList.remove("fa-regular");
      icon.classList.add("fa-solid");
    } else if (result.message === "unliked") {
      icon.style.color = "";
      icon.classList.remove("fa-solid");
      icon.classList.add("fa-regular");
    }
  } catch (error) {
    if (isCurrentlyLiked) {
      icon.style.color = "var(--accent-red)";
      icon.classList.remove("fa-regular");
      icon.classList.add("fa-solid");
      countSpan.textContent = currentCount;
    } else {
      icon.style.color = "";
      icon.classList.remove("fa-solid");
      icon.classList.add("fa-regular");
      countSpan.textContent = currentCount;
    }
  }
}

async function handlePostActions(e) {
  console.log(e);

  const likeBtn = e.target.closest(".post-like");

  if (likeBtn) {
    const postId = likeBtn.dataset.id;
    await toggleLike(postId, likeBtn);
    return;
  }

  const commentBtn = e.target.closest(".post-comments");
  if (commentBtn) {
    const postId = commentBtn.dataset.id;
    console.log("Comments:", postId);
    window.location.hash = `/post/${postId}`;
  }
}

async function loadPosts() {
  const res = await fetch("http://localhost:9090/posts", {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const result = await res.json();

  if (!res.ok) {
    console.log(result);
    Baner(result.error, result.message);
    return;
  }

  const posts = result.data.all_posts;

  const postsHTML = posts
    .map(
      (post) => `
      
        <div class="card" data-post-id="${post.id}">
            <div class="post-header">
              <div class="post-author">
                <img
                  src="./assets/images/download.jpeg"
                  alt="Author"
                />
                <div class="author-info">
                  <h4>${post.user_name}</h4>
                  <span>${post.creat_at}</span>
                </div>
              </div>
              <i
                class="ri-more-fill"
                style="color: var(--text-muted); cursor: pointer"
              ></i>
            </div>
            <div class="post-content">
              <h3> ${post.title} </h3>
              <p> ${post.content}</p>
            </div>
              ${post.image_url ? '<img class="post-image"src="' + post.image_url + '" alt=""/>' : ""}

              <div class="post-footer">
                <span class="post-like" data-id="${post.id}">
                  <i class="${post.is_like ? "fa-solid" : "fa-regular"} fa-heart" 
                    style="${post.is_like ? "color: var(--accent-red);" : ""}"></i>
                  <span class="like-count">${post.like_count}</span>
                </span>
                
                <span class="post-comments" data-id="${post.id}">
                  <i class="fa-regular fa-comment"></i> ${post.dislike_count}
                </span>
              </div>
          </div>
      `,
    )
    .join("");

  const cardContainer = document.querySelector(".card-container");
  cardContainer.innerHTML = postsHTML;

  cardContainer.addEventListener("click", handlePostActions);
}

export default function FeedPage() {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "./assets/styles/card-post.css";
  document.head.appendChild(link);
  loadPosts();
  NavBar();

  return `<div class="card-container"></div>`;
}
