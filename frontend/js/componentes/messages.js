import escapeHtml from "../shared/formate-text.js";
import MainHeaders from "../shared/main-headers.js";
import { on, send } from "../shared/ws-provider.js";
import NavBar from "./nave-bare.js";
import Banner from "./ui/baner.js";
// import wsProvider from "../shared/ws-provider.js";

const MSG_LIMIT = 10;

// Module-level cleanup reference to unmount previous handlers when changing routes
let currentCleanup = null;

export default function Messages() {
  MainHeaders();

  // Run cleanup if user re-mounts the view
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  // Load Styles
  for (const href of [
    "../../assets/styles/messages.css",
    "../../assets/styles/chat-page.css",
  ]) {
    if (!document.querySelector(`link[href="${href}"]`)) {
      Object.assign(document.head.appendChild(document.createElement("link")), {
        rel: "stylesheet",
        href,
      });
    }
  }

  NavBar();

  // Render Shell DOM
  document.getElementById("app").innerHTML = `
    <div class="Messages-box">
      <div id="users-list"></div>
      <div id="user-chat">
        <div class="mobile-chat-header">
          <button class="mobile-back-btn" type="button">← Back</button>
          <div class="mobile-chat-title"><h4 class="chat-user-name">Select a user</h4></div>
        </div>
        <main class="main-chat-window">
          <div class="chat-header">
            <div class="active-user-info">
              <a href="#/" class="back-home-btn"><i class="fa-solid fa-angle-left"></i></a>
              <div class="chat-avatar"><img src="../../assets/images/download.jpeg" alt="Avatar"></div>
              <div class="item-text">
                <h4 class="chat-user-name">Select a user</h4>
                <p class="status-text"><span class="status-dot"></span><span class="chat-status-text">Choose a contact to begin</span></p>
              </div>
            </div>
          </div>
          <div class="chat-messages-body">
            <div class="chat-placeholder"><p>Select a user to start messaging.</p></div>
          </div>
          <div class="chat-input-footer">
            <form class="chat-input-form" id="messageform">
              <input type="text" name="message-content" class="message-input" placeholder="Select a user to start messaging..." autocomplete="off" disabled>
              <button type="submit" class="send-message-btn" disabled><i class="fa-regular fa-paper-plane"></i></button>
            </form>
          </div>
        </main>
      </div>
    </div>`;

  // Local Scoped State (No Classes)
  let users = [];
  let activeUser = null;
  let allMessages = [];
  let offset = 0;
  let allLoaded = false;
  let loadingMore = false;

  // DOM Node Caching
  const elements = {
    usersList: document.querySelector("#users-list"),
    chatName: document.querySelectorAll("#user-chat .chat-user-name"),
    chatStatus: document.querySelector("#user-chat .chat-status-text"),
    chatBody: document.querySelector("#user-chat .chat-messages-body"),
    chatForm: document.querySelector("#user-chat #messageform"),
    messageInput: document.querySelector("#user-chat .message-input"),
    sendButton: document.querySelector("#user-chat .send-message-btn"),
    backButton: document.querySelector("#user-chat .mobile-back-btn"),
  };

  // ── Render Functions ────────────────────────────────────────────────────────

  function createMessageHTML(msg) {
    const incoming = String(msg.sender_id) === String(activeUser?.id);
    const name = escapeHtml(msg.sender_name || (incoming ? "" : "You"));
    const content = escapeHtml(msg.content || "");
    const time = escapeHtml(
      msg.create_time || msg.creat_time || new Date().toLocaleTimeString(),
    );
    const avatar = msg.sender_avatar || "../../assets/images/download.jpeg";

    if (incoming) {
      return `
        <div class="message-row incoming" data-temp-id="${msg.temp_id || ""}">
          <div class="chat-avatar msg-avatar"><img src="${avatar}" alt="Avatar"></div>
          <div>
            <h5>${name}</h5>
            <div class="message-content"><p>${content}</p><span class="message-time">${time}</span></div>
          </div>
        </div>`;
    }

    return `
      <div class="message-row outgoing" data-temp-id="${msg.temp_id || ""}">
        <div style="text-align:right">
          <h5>${name}</h5>
          <div class="message-content"><div><p>${content}</p><span class="message-time">${time}</span></div></div>
        </div>
      </div>`;
  }

  function appendSingleMessage(msg) {
    if (!elements.chatBody) return;

    const placeholder = elements.chatBody.querySelector(".chat-placeholder");
    if (placeholder) placeholder.remove();

    if (msg.temp_id) {
      const optEl = elements.chatBody.querySelector(
        `[data-temp-id="${msg.temp_id}"]`,
      );
      if (optEl) {
        optEl.outerHTML = createMessageHTML(msg);
        return;
      }
    }

    elements.chatBody.insertAdjacentHTML("beforeend", createMessageHTML(msg));
    elements.chatBody.scrollTo({
      top: elements.chatBody.scrollHeight,
      behavior: "smooth",
    });
  }

  function renderFullChatBody() {
    if (!elements.chatBody) return;

    if (!activeUser || !allMessages.length) {
      elements.chatBody.innerHTML = `<div class="chat-placeholder"><p>${
        activeUser
          ? "No messages yet. Send the first message."
          : "Select a user from the list to start a conversation."
      }</p></div>`;
      return;
    }

    elements.chatBody.innerHTML = allMessages
      .map((m) => createMessageHTML(m))
      .join("");
    elements.chatBody.scrollTo({
      top: elements.chatBody.scrollHeight,
      behavior: "instant",
    });
  }

  function updateHeader() {
    elements.chatName.forEach((n) => {
      n.textContent = activeUser ? activeUser.user_name : "Select a user";
    });

    if (elements.chatStatus) {
      elements.chatStatus.textContent = activeUser
        ? activeUser.is_online
          ? "Online"
          : "Offline"
        : "Choose a contact to begin";
    }

    if (elements.messageInput) {
      elements.messageInput.disabled = !activeUser;
      elements.messageInput.placeholder = activeUser
        ? "Type a message..."
        : "Select a user to start messaging...";
    }

    if (elements.sendButton) elements.sendButton.disabled = !activeUser;
  }


  async function fetchUsers() {
    try {
      const res = await fetch("http://localhost:9090/getallusers", {
        method: "GET",
        credentials: "include",
      });
      const result = await res.json();
      if (!res.ok) {
        Banner(result.error, result.message);
        return;
      }

      users = result.data || [];
      if (!elements.usersList) return;

      if (!users.length) {
        elements.usersList.innerHTML = `<div class="users-empty-state"><p>No users available.</p></div>`;
        return;
      }

      elements.usersList.innerHTML = users
        .map(
          (u) => `
        <div class="user-row ${u.is_online ? "online" : "offline"}" data-id="${u.id}">
          <div class="user-avatar-wrap">
            <img src="../../assets/images/download.jpeg" alt="Avatar" class="user-avatar">
            <span class="online-dot"></span>
          </div>
          <div class="user-info">
            <span class="user-name">${escapeHtml(u.user_name)}</span>
            <span class="user-status">${u.is_online ? "Online" : "Offline"}</span>
          </div>
        </div>`,
        )
        .join("");
    } catch (err) {
      Banner("Request Error", "Unable to load user list.");
    }
  }

  async function fetchMessagesForUser(targetOffset = 0) {
    if (!activeUser) return;
    try {
      const res = await fetch(
        `http://localhost:9090/getcahtinfo/${activeUser.id}?limit=${MSG_LIMIT}&offset=${targetOffset}`,
        { method: "GET", credentials: "include" },
      );
      const result = await res.json();
      if (!res.ok) {
        Banner(result.error, result.message);
        return;
      }

      const incoming = result.data?.AllMessages || [];
      if (incoming.length < MSG_LIMIT) allLoaded = true;

      if (targetOffset === 0) {
        allMessages = incoming;
        renderFullChatBody();
      } else {
        const prevHeight = elements.chatBody
          ? elements.chatBody.scrollHeight
          : 0;
        allMessages = [...incoming, ...allMessages];
        renderFullChatBody();
        if (elements.chatBody)
          elements.chatBody.scrollTop =
            elements.chatBody.scrollHeight - prevHeight;
      }
    } catch (err) {
      console.error("Failed fetching chat history:", err);
    } finally {
      loadingMore = false;
    }
  }



  function selectUser(user) {
    activeUser = user;
    allMessages = [];
    offset = 0;
    allLoaded = false;
    loadingMore = false;

    document
      .querySelector(".Messages-box")
      ?.classList.toggle("chat-open", !!user);
    document
      .querySelectorAll(".user-row")
      .forEach((row) =>
        row.classList.toggle(
          "active",
          !!user && row.dataset.id === String(user.id),
        ),
      );

    updateHeader();
    renderFullChatBody();
    if (user) fetchMessagesForUser(0);
  }

  // Event Handlers
  function onChatMessage(msg) {
    if (!activeUser) return;
    const sid = String(msg.sender_id ?? "");
    const rid = String(msg.recipient_id ?? "");
    const uid = String(activeUser.id);

    if (sid !== uid && rid !== uid) return;

    allMessages.push(msg);
    appendSingleMessage(msg);
  }

  function handleScroll() {
    if (
      !elements.chatBody ||
      elements.chatBody.scrollTop > 0 ||
      !activeUser ||
      allLoaded ||
      loadingMore
    )
      return;
    loadingMore = true;
    offset += MSG_LIMIT;
    fetchMessagesForUser(offset);
  }

  function handleUserClick(e) {
    const row = e.target.closest(".user-row");
    if (!row) return;
    const user = users.find((u) => String(u.id) === String(row.dataset.id));
    if (user) selectUser(user);
  }

  function handleSend(e) {
    e.preventDefault();
    if (!activeUser) {
      Banner(
        "Select a user first",
        "Choose a contact before sending a message.",
      );
      return;
    }

    const text = elements.messageInput?.value.trim();
    if (!text) return;

    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const payload = {
      content: text,
      recipient_id: Number(activeUser.id),
      temp_id: tempId,
    };

    const optimisticMsg = {
      ...payload,
      sender_id: -1,
      sender_name: "You",
      create_time: new Date().toLocaleTimeString(),
    };

    allMessages.push(optimisticMsg);
    appendSingleMessage(optimisticMsg);
    elements.messageInput.value = "";

    if (!send(payload)) {
      allMessages = allMessages.filter((m) => m.temp_id !== tempId);
      const optNode = elements.chatBody.querySelector(
        `[data-temp-id="${tempId}"]`,
      );
      if (optNode) optNode.remove();
      Banner("Connection Error", "WebSocket connection is closed. Try again.");
    }
  }

  function handleBack() {
    selectUser(null);
  }

  // Attach Listeners
  on("message", onChatMessage);
  if (elements.usersList)
    elements.usersList.addEventListener("click", handleUserClick);
  if (elements.chatBody)
    elements.chatBody.addEventListener("scroll", handleScroll);
  if (elements.chatForm)
    elements.chatForm.addEventListener("submit", handleSend);
  if (elements.backButton)
    elements.backButton.addEventListener("click", handleBack);

  // Initialize
  fetchUsers();

  // Define cleanup callback for route unmounting
  currentCleanup = () => {
    wsProvider.off("message", onChatMessage);
    if (elements.usersList)
      elements.usersList.removeEventListener("click", handleUserClick);
    if (elements.chatBody)
      elements.chatBody.removeEventListener("scroll", handleScroll);
    if (elements.chatForm)
      elements.chatForm.removeEventListener("submit", handleSend);
    if (elements.backButton)
      elements.backButton.removeEventListener("click", handleBack);
  };
}
