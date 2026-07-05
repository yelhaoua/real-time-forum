export default function CommentsBox() {
    const commentsBox = document.createElement('div');
    commentsBox.id = "commentsBox"
    commentsBox.innerHTML = `
            <div id="singleComm">
                <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                    alt="User Avatar"
                    class="avatar"
                />
                <div id="text-box"><p>/p></div>
            </div>
    `

    const container = document.getElementById("card-container");
    container.appendChild(commentsBox)
}