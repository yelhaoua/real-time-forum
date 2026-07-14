import escapeHTML from "../shared/formate-text.js";

export default function Comments(data) {
  const commentsCont = document.getElementById("commentsBox");
  if (data) {
    console.log(data, "heloo");

    const content = data.data;
    if (content) {
      content.forEach((comment) => {
        commentsCont.insertAdjacentHTML(
          "beforeend",
          `
            <div class="single-comment">
                  <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                      alt="User Avatar"
                      class="avatar"
                  />
                  <div class="comment-text-box">
                  <p class="comments-body">
                        ${escapeHTML(comment.content)}
                  </p>
                  </div>
              </div>
        `,
        );
      });
    }
  }
}
