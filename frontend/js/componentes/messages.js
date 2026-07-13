import MainHeaders from "../shared/main-headers.js";
import ChatPage from "./chat-page.js";
import NavBar from "./nave-bare.js";
import Baner from "./ui/baner.js";

async function GetUsers() {
  const res = await fetch("http://localhost:9090/getallusers", {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const result = await res.json();

  if (!res.ok) {
    console.log(result);
    Baner(result.error, result.message);
    return;
  }
  const users = result.data;
  let userList = "";
  if (users) {
    userList = users
      .map(
        (user) => `
        <div class="user-row ${user.is_online ? "online" : ""}" data-username="${user.user_name}" data-id="${user.id}">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Avatar" class="user-avatar" />
            <div class="user-info">
                <span class="user-name">${user.user_name}</span>
                <span class="user-status">${user.is_online ? "Online" : ""}</span>
            </div>
        </div>
    `,
      )
      .join("");
  }
  const cardContainer = document.querySelector("#users-list");
  cardContainer.innerHTML = userList;
}

export default function Messages() {
    MainHeaders()
  NavBar();
  if (!document.querySelector('link[href*="messages.css"]')) {
    let link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "../../assets/styles/messages.css";
    document.head.appendChild(link);
  }

  GetUsers();

  return `
    <div class="Messages-box">
        <div id="users-list"></div>

        <div id="user-chat">
            <div class="mobile-chat-header">
                <button class="mobile-back-btn">← Back</button>
            </div>
            <div class="chat-placeholder">
                <p>Select a user from the list to start a private message conversation.</p>
            </div>
        </div>
    </div>
  `;
}
