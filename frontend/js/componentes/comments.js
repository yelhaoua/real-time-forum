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
                      src="../../assets/images/download.jpeg"
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
