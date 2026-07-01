export default function FeedPage() {
  let app = document.getElementById("app");
  
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "./assets/styles/login.css";
  head.appendChild(link);

  app.innerHTML = `
    <div id="nav-bar"></div>
        <div class="container">
        <div class="left-said"></div>
        <div class="feed-center">
            <div class="post-info">
                <div id="post-header">
                    <img src="./assets/images/download.jpeg" alt="User Profile" srcset="">
                    <div id="post-head-info">
                        <h4 id="post-profile-name">DIPLO TEST</h4>
                        <p id="post-time">2 min ago</p>
                    </div>
                </div>
                <p id="post-body">
                    Was great meeting up with Anna Ferguson and Dave Bishop at the breakfast talk!
                    #breakfast
                </p>
                <div id="post-actions">
                    <button id="post-like"><i class="fa-regular fa-heart"></i> <span id="like-counter">45</span></button>
                    <button id="post-comments"><i class="fa-regular fa-comment"></i><span id="comment-counter">16</span></button>
                </div>
            </div>
        </div>
        <div class="right-said"></div>
    </div>
    `;
    
}
