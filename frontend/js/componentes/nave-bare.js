import Logout from "./auth/logout.js";
import Banner from "./ui/baner.js";

export default async function NavBar() {


  const renderNav = (user = null) => {
    const isAuth = !!user;

    return `
      <header class="top-nav">
        <div class="nav-left">
          <div class="logo"><i class="ri-hexagon-fill"></i></div>
          <button class="hamburger-btn" id="hamburgerBtn" aria-label="Toggle Navigation">
            <i class="fa-solid fa-bars icon-open"></i>
            <i class="fa-solid fa-xmark icon-close"></i>
          </button>
        </div>

        <div class="nav-overlay" id="navOverlay"></div>

        <div class="nav-drawer" id="navDrawer">
          <nav class="nav-menu">
            <a href="#" class="nav-item active">
              <i class="ri-home-4-line"></i> Home Page
            </a>
            ${
              isAuth
                ? `
              <a href="#/craet-post" class="nav-item">
                <i class="ri-team-line"></i> New Post
              </a>
              <a href="#/chat-page" class="nav-item">
                <i class="ri-chat-3-line"></i> Messages
              </a>
            `
                : ""
            }
          </nav>

          ${
            isAuth
              ? `
            <div class="user-nav-profile">
              <img
                src="../../assets/images/download.jpeg"
                alt="User"
              />
              <span class="user-nav-name">${user}</span>
              <button id="logoutBtn" class="nav-action-btn" type="button">Logout</button>
            </div>
          `
              : `
            <div class="user-nav-profile">
              <a href="#/login" class="nav-action-btn">Login</a>
            </div>
          `
          }
        </div>
      </header>
    `;
  };

  try {
    const req = await fetch("http://localhost:9090/getinfo", {
      method: "GET",
      headers: { "Content-type": "application/json" },
      credentials: "include",
    });

    const res = await req.json();
    const navContainer = document.getElementById("nav-bar");

    if (!req.ok) {
      navContainer.innerHTML = renderNav(null);
    } else {
      navContainer.innerHTML = renderNav(res.data);
      const logoutBtn = document.getElementById("logoutBtn");
      if (logoutBtn) logoutBtn.addEventListener("click", Logout);
    }

    const hamburgerBtn = document.getElementById("hamburgerBtn");
    const navDrawer = document.getElementById("navDrawer");
    const navOverlay = document.getElementById("navOverlay");

    const toggleMenu = () => {
      hamburgerBtn.classList.toggle("is-active");
      navDrawer.classList.toggle("is-open");
      navOverlay.classList.toggle("is-active");
      document.body.classList.toggle("no-scroll");
    };

    hamburgerBtn?.addEventListener("click", toggleMenu);
    navOverlay?.addEventListener("click", toggleMenu);

    navDrawer
      ?.querySelectorAll(".nav-item, .nav-action-btn")
      .forEach((link) => {
        link.addEventListener("click", () => {
          if (navDrawer.classList.contains("is-open")) toggleMenu();
        });
      });
  } catch (error) {
    console.error("Failed to fetch user info:", error);
    if (typeof Baner === "function") {
      Banner("Error", "Failed to load user information.", "error");
    }
  }
}
