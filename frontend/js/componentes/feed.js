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
    await toggleLike(postId);
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
      
        <div class="card" data-post-id="${post.Id}">
            <div class="post-header">
              <div class="post-author">
                <img
                  src="./assets/images/download.jpeg"
                  alt="Author"
                />
                <div class="author-info">
                  <h4>${post.UserName}</h4>
                  <span>${post.Creat_at}</span>
                </div>
              </div>
              <i
                class="ri-more-fill"
                style="color: var(--text-muted); cursor: pointer"
              ></i>
            </div>
            <div class="post-content">
              <h3> ${post.Title} </h3>
              <p> ${post.Content}</p>
            </div>
              ${post.Image_Image_url ? '<img class="post-image"src="' + post.Image_Image_url + '" alt=""/>' : ""}

            <div class="post-footer">
              <span data-id="${post.Id}"
                ><i class="fa-regular fa-heart" style="color: var(--accent-red)"></i>
                ${post.LikeCount}</span
              >
              <span><i class="fa-regular fa-comment"></i></i> ${post.DislikeCount}</span>
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
  window.onload = function () {
    setTimeout(loadPosts);
  };
  NavBar();
  return `<div class="card-container"></div>`;
}
