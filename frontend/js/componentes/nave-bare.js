import Baner from "./ui/baner.js";

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
      Baner(res.error, res.message);
      return;
    }

    console.log(res);
    document.getElementById("nav-bar").innerHTML = `
    <header>
        <div class="nav-left">
          <div class="logo"><i class="ri-hexagon-fill"></i></div>
          <div class="search-bar">
            <i class="ri-search-line"></i>
            <input type="text" placeholder="Search" />
          </div>
        </div>
        <nav class="nav-menu">
          <a href="#" class="nav-item active"
            ><i class="ri-home-4-line"></i> Homepage</a
          >
          <a href="#" class="nav-item"
            ><i class="ri-team-line"></i> Connections</a
          >
          <a href="#" class="nav-item"
            ><i class="ri-chat-3-line"></i> Messages</a
          >
          <a href="#" class="nav-item"
            ><i class="ri-notification-3-line"></i> Notifications
            <span class="notification-badge">2</span></a
          >
          <a href="#" class="nav-item"><i class="ri-apps-2-line"></i> Tools</a>
        </nav>
        <div class="user-nav-profile">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="User"
          />
          <span style="font-size: 13px; font-weight: 600">${res.data}</span>
          <i class="ri-arrow-down-s-line" style="color: var(--text-muted)"></i>
        </div>
      </header>
    `;
  } catch (error) {}
}
