

export default function ChatList() {
  if (
    !document.querySelector(`link[href="../../assets/styles/pepole-list.css"]`)
  ) {
    let link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "../../assets/styles/pepole-list.css";
    document.head.appendChild(link);
  }

  let users = [];

  const chatListContainer = document.createElement("div");

  chatListContainer.innerHTML = `
    <aside class="right-sidebar">
    
          <form id="search-form" onsubmit="event.preventDefault();">
            <input type="text" id="user-search-input" name="username" placeholder="Search user...">
          </form>

        <div class="item-list"  id="chat-item-list">
        </div>
      </div>
    </aside>
  `;

  const searchInput = chatListContainer.querySelector("#user-search-input");
  const itemList = chatListContainer.querySelector("#chat-item-list");

  itemList.addEventListener("click", (e) => {
    if ((e.target.id = "close-list")) {
      itemList.style.display = "none";
    }
  });
  searchInput.addEventListener("input", () => {
    console.log("ddd");

    if (users) {
      itemList.style.display = "flex";
    }
  });

  function renderUsers(usersToRender) {
    console.log(usersToRender);

    if (usersToRender.length == 0) {
      itemList.style.display = "none";
    } else {
      itemList.style.display = "flex";
    }
    console.log("render", usersToRender);

    if (usersToRender.length === 0) {
      itemList.innerHTML = `<p style="padding: 10px; color: #888; font-size: 13px;">No users found</p>`;
      return;
    }

    itemList.innerHTML =
      `<div class="people-header">
  <p class="header-title">All users found</p>
  <button id="close-list" class="close-btn">
    <!-- Icon or text can go here -->
    <span class="icon">✕</span> Close
  </button>
</div>` +
      usersToRender
        .map(
          (user) => `
        <a href="#/chat/${user.id}" class="list-item chat-item" data-id="${user.id}">
          <div class="item-info">
            <div class="chat-avatar">
              <img src="/uploads${user.profile_image}" alt="${user.profile_image}">
            </div>
            <div class="item-text">
              <h4>${user.user_name}</h4>
            </div>
          </div>
          ${"" ? `<span class="chat-badge">${""}</span>` : ""}
        </a>
      `,
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
        credentials: "include",
      });
      const res = await req.json();

      if (!req.ok) {
        Baner(res.error, res.message);
        return;
      }
      users = res.data;
      renderUsers(users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      Baner("Error", "Failed to fetch users. Please try again later.", "error");
    }
  });

  renderUsers(users);

  return chatListContainer;
}
