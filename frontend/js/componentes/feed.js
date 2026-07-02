import NavBar from "./nave-bare.js";

async function toggleLike(postId) {
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
    console.log(result);
}

async function handlePostActions(e) {
  console.log(e);

  const likeBtn = e.target.closest(".post-like");
  
  if (likeBtn) {
    const postId = likeBtn.dataset.id;
    console.log("Like:", postId);
    await toggleLike(postId)
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
    return;
  }

  const posts = result.Data.AllPosts;

  const postsHTML = posts
    .map(
      (post) => `
        <div class="post-info" data-post-id="${post.Id}">
          <div id="post-header">
            <img src="./assets/images/download.jpeg" alt="User Profile">
            <div id="post-head-info">
              <h4 id="post-profile-name">${post.UserName}</h4>
              <p id="post-time">${post.Creat_at}</p>
            </div>
          </div>

          <h3>${post.Title}</h3>

          <p id="post-body">
            ${post.Content}
          </p>

          <div id="post-actions">
            <button class="post-like" data-id="${post.Id}">
                <i class="${post.Isliked ? "fa-solid" : "fa-regular"} fa-heart"></i>
                <span id="like-counter">${post.LikeCount}</span>
            </button>

            <button class="post-comments" data-id="${post.Id}">
              <i class="fa-regular fa-comment"></i>
              <span id="comment-counter">${post.DislikeCount}</span>
            </button>
          </div>
        </div>
      `,
    )
    .join("");

  const postsContainer = document.getElementById("posts");
  postsContainer.innerHTML = postsHTML;

  postsContainer.addEventListener("click", handlePostActions);
}


export default function FeedPage() {
  setTimeout(loadPosts);

  let app = document.getElementById("app");
  const head = document.querySelector("head");

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "./assets/styles/feed.css";
  document.head.appendChild(link);

  NavBar();

  return `
    <div class="container">
      <div class="left-said"></div>

      <div class="feed-center" id="posts">
      </div>

      <div class="right-said"></div>
    </div>
  `;
}
