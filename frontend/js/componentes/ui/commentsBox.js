export default function CommentsBox() {
    const commentsBox = document.createElement('div');
    commentsBox.id = "commentsBox"
    const container = document.getElementById("card-container");
    container.appendChild(commentsBox)
}