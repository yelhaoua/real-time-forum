export default function CardPost() {
  const link = document.createElement("link");

  link.rel = "stylesheet";
  link.href = "../../../assets/styles/card-post.css";

  document.head.appendChild(link);

  return `
    <div class="card">
            <div class="post-header">
              <div class="post-author">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                  alt="Author"
                />
                <div class="author-info">
                  <h4>Alan Patterson</h4>
                  <span>2 hours ago</span>
                </div>
              </div>
              <i
                class="ri-more-fill"
                style="color: var(--text-muted); cursor: pointer"
              ></i>
            </div>
            <div class="post-content">
              Was great meeting up with Anna Ferguson and Dave Bishop at the
              breakfast talk! 🥞 #breakfast
            </div>
            <img
              class="post-image"
              src="https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80"
              alt="Breakfast pancakes"
            />

            <div class="post-footer">
              <span
                ><i class="fa-regular fa-heart" style="color: var(--accent-red)"></i>
                45</span
              >
              <span><i class="fa-regular fa-comment"></i></i> 16</span>
            </div>
          </div>
          `;
}
