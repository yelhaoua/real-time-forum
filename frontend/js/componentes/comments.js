export default function Comments(data) {
  const commentsCont = document.getElementById("commentsBox");
    if (data) { 
    console.log(data ,"heloo");
    
    const content = data.data
    content.forEach(comment => {
        commentsCont.insertAdjacentHTML('beforeend', `
            <div id="singleComm">
                  <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                      alt="User Avatar"
                      class="avatar"
                  />
                  <div id="text-box">
                  <p id="comments-body">
                        ${comment.content}
                  </p>
                  </div>
              </div>
        `)
    });
}

}
