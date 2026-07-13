import escapeHTML from "../../shared/formate-text.js";

export default function CardPost(data) {
  console.log(data);

  const link = document.createElement("link");

  link.rel = "stylesheet";
  link.href = "./assets/styles/card-post.css";

  document.head.appendChild(link);

  const card = document.createElement("div");

  card.className = "card";
  card.dataset.postId = data.post_id;
  card.innerHTML = `
            <div class="post-header">
              <div class="post-author">
                <img
                  src="./assets/images/download.jpeg"
                  alt="Author"
                />
                <div class="author-info">
                  <h4>${escapeHTML(data.user_name)}</h4>
                  <span>${escapeHTML(data.created_at)}</span>
                </div>
              </div>
              <i
                class="ri-more-fill"
                style="color: var(--text-muted); cursor: pointer"
              ></i>
            </div>
            <div class="post-content">
              <h3> ${escapeHTML(data.title)} </h3>
              <p> ${escapeHTML(data.content)}</p>
            </div>
              ${data.image_url ? '<img class="post-image"src="' + data.image_url + '" alt=""/>' : ""}

              <div class="post-footer">
                <span class="post-like" data-id="${data.post_id}">
                  <i class="${data.is_liked ? "fa-solid" : "fa-regular"} fa-heart"
                    style="${data.is_liked ? "color: var(--accent-red);" : ""}"></i>
                  <span class="like-count">${data.like_count}</span>
                </span>
                <span class="post-dislike" data-id="${data.post_id}">
                  <i class="${data.is_disliked ? "fa-solid" : "fa-regular"} fa-thumbs-down"
                    style="${data.is_disliked ? "color: var(--primary);" : ""}"></i>
                  <span class="dislike-count">${data.dislike_count}</span>
                </span>
                <span class="post-comments" data-id="${data.post_id || "not found"}">
                  <i class="fa-regular fa-comment"></i> ${data.comment_count}
                </span>
              </div>
          `;

  return card;
}
