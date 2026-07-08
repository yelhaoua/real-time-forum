import Baner from "./ui/baner.js";

export default function ChatList() {

  if (!document.querySelector(`link[href="../../assets/styles/pepole-list.css"]`)) {
    let link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "../../assets/styles/pepole-list.css";
    document.head.appendChild(link);
  }


  let users = [];


  const chatListContainer = document.createElement("div");


  chatListContainer.innerHTML = `
    <aside class="right-sidebar">
      <div class="card chat-sidebar-card">
        <div class="menu-section-title">
          <form id="search-form" onsubmit="event.preventDefault();">
            <input type="text" id="user-search-input" name="username" placeholder="Search user...">
          </form>
        </div>
        
        <div class="item-list" id="chat-item-list">
          <!-- Filtered users will render here dynamically -->
        </div>

        <a href="#" class="view-all chat-view-all">View All</a>
      </div>
    </aside>
  `;

  const searchInput = chatListContainer.querySelector("#user-search-input");
  const itemList = chatListContainer.querySelector("#chat-item-list");


  function renderUsers(usersToRender) {
    console.log("render");

    if (usersToRender.length === 0) {
      itemList.innerHTML = `<p style="padding: 10px; color: #888; font-size: 13px;">No users found</p>`;
      return;
    }

    itemList.innerHTML = usersToRender
      .map(
        (user) => `
        <a href="#" class="list-item chat-item" data-id="${user}">
          <div class="item-info">
            <div class="chat-avatar">
              <img src="${""}" alt="${""}">
            </div>
            <div class="item-text">
              <h4>${user}</h4>
              <p>${user}</p>
            </div>
          </div>
          ${"" ? `<span class="chat-badge">${""}</span>` : ""}
        </a>
      `
      )
      .join("");
  }


  searchInput.addEventListener("input", async (e) => {
    const query = e.target.value.trim();
    try {
      const req = await fetch("http://localhost:9090/getuser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(query),
        credentials: "include"
      })
      const res = await req.json()

      if (!req.ok) {
        Baner(res.error, res.message)
        return
      }
      console.log("hnaaaa", res, req);
      users = res.data


      renderUsers(users)


    } catch (error) {

    }
    const filteredUsers = users.filter((user) =>
      user.name.toLowerCase().includes(query)
    );
    ;
  });


  renderUsers(users);

  return chatListContainer;
}