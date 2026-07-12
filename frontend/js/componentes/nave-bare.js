import Baner from "./ui/baner.js";
import Logout from "../auth/logout.js";
import ChatList from "./pepole-list.js";

export default async function NavBar() {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "../../assets/styles/nav-var.css";
  document.head.appendChild(link);

  try {
    const req = await fetch("http://localhost:9090/getinfo", {
      method: "GET",
      headers: { "Content-type": "application/json" },
      credentials: "include",
    });

    const res = await req.json();
    if (!req.ok) {
      document.getElementById("nav-bar").innerHTML = `
      <header class="top-nav">
          <div class="nav-left">
            <div class="logo"><i class="ri-hexagon-fill"></i></div>
            
          </div>
          <nav class="nav-menu">
            <a href="#/" class="nav-item active">
              <i class="ri-home-4-line"></i> Homepage
            </a>
            <a href="#/login" class="nav-action-btn">Login</a>
          </nav>
        </header>
      `;
      return;
    }

    console.log(res);
    document.getElementById("nav-bar").innerHTML = `
    <header class="top-nav">
        <div class="nav-left">
          <div class="logo"><i class="ri-hexagon-fill"></i></div>
        </div>
        <nav class="nav-menu">
          <a href="#" class="nav-item active"
            ><i class="ri-home-4-line"></i> Home Page</a
          >
          <a href="#/craet-post" class="nav-item"
            ><i class="ri-team-line"></i> New Post</a
          >
          <a href="#/chat-page" class="nav-item"
            ><i class="ri-chat-3-line"></i> Messages</a
          >
          
        </nav>
        <div class="search-users"></div>
        <div class="user-nav-profile">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="User"
          />
          <span class="user-nav-name">${res.data}</span>
          <button id="logoutBtn" class="nav-action-btn" type="button">Logout</button>
        </div>
      </header>
    `;

    document.querySelector(".search-users").appendChild(ChatList());
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", Logout);
    }
  } catch (error) {}
}
