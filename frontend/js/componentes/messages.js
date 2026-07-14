import MainHeaders from "../shared/main-headers.js";
import NavBar from "./nave-bare.js";
import Baner from "./ui/baner.js";

const API_BASE = "http://localhost:9090";
const DEFAULT_AVATAR = "../../assets/images/download.jpeg";

function ensureStylesheet(href) {
  if (!document.querySelector(`link[href="${href}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function createEmptyState() {
  return {
    users: [],
    activeUser: null,
    pendingMessages: [],
    chatHistory: {
      Resc_user_name: "",
      AllMessages: [],
    },
    ws: null,
  };
}

function getState() {
  if (!window.__messagesPageState) {
    window.__messagesPageState = createEmptyState();
  }
  return window.__messagesPageState;
}

function getUsersListElement() {
  return document.querySelector("#users-list");
}

function getChatShellElements() {
  return {
    page: document.querySelector(".Messages-box"),
    chatPane: document.querySelector("#user-chat"),
    chatName: document.querySelectorAll("#user-chat .chat-user-name"),
    chatStatus: document.querySelector("#user-chat .chat-status-text"),
    chatBody: document.querySelector("#user-chat .chat-messages-body"),
    chatForm: document.querySelector("#user-chat #messageform"),
    messageInput: document.querySelector("#user-chat .message-input"),
    sendButton: document.querySelector("#user-chat .send-message-btn"),
    backButton: document.querySelector("#user-chat .mobile-back-btn"),
  };
}

function renderMessage(activeUserId, message) {
  const incoming = String(message.sender_id) === String(activeUserId);
  const rowClass = incoming ? "incoming" : "outgoing";
  const avatar = message.sender_avatar || DEFAULT_AVATAR;
  const safeName = escapeHtml(message.sender_name || (incoming ? "" : "You"));
  const safeContent = escapeHtml(message.content || "");
  const messageTime = escapeHtml(
    message.creat_time || message.create_time || "",
  );

  if (incoming) {
    return `
      <div class="message-row ${rowClass}">
        <div class="chat-avatar msg-avatar">
          <img src="${avatar}" alt="Avatar">
        </div>
        <div>
          <h5>${safeName}</h5>
          <div class="message-content">
            <p>${safeContent}</p>
            <span class="message-time">${messageTime}</span>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="message-row ${rowClass}">
      <div style="text-align: right">
        <h5>${safeName}</h5>
        <div class="message-content">
          <div>
            <p>${safeContent}</p>
            <span class="message-time">${messageTime}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function normalizeMessage(message, activeUser) {
  const normalized = { ...message };
  const isIncoming =
    activeUser &&
    String(normalized.sender_id) === String(activeUser.id);

  if (!normalized.sender_name) {
    normalized.sender_name = isIncoming
      ? activeUser?.user_name || ""
      : "You";
  }

  if (!normalized.create_time && !normalized.creat_time && normalized.timestamp) {
    normalized.create_time = new Date(normalized.timestamp).toLocaleTimeString();
  }

  return normalized;
}

function isConversationMessage(message, user) {
  if (!message || !user) return false;

  const senderId = String(message.sender_id ?? "");
  const recipientId = String(message.recipient_id ?? "");
  const activeUserId = String(user.id);

  return senderId === activeUserId || recipientId === activeUserId;
}

function integrateMessage(list, freshMessage, activeUser) {
  const normalizedFresh = normalizeMessage(freshMessage, activeUser);
  const nextList = [...list];

  const optimisticIndex = nextList.findIndex(
    (message) =>
      message.__optimistic &&
      message.content === normalizedFresh.content &&
      String(message.recipient_id ?? "") ===
        String(normalizedFresh.recipient_id ?? ""),
  );

  if (optimisticIndex !== -1) {
    nextList[optimisticIndex] = {
      ...normalizedFresh,
    };
    delete nextList[optimisticIndex].__optimistic;
    return nextList;
  }

  const exactIndex = nextList.findIndex(
    (message) =>
      String(message.sender_id ?? "") === String(normalizedFresh.sender_id ?? "") &&
      String(message.recipient_id ?? "") ===
        String(normalizedFresh.recipient_id ?? "") &&
      message.content === normalizedFresh.content &&
      (message.create_time || message.creat_time || "") ===
        (normalizedFresh.create_time || normalizedFresh.creat_time || ""),
  );

  if (exactIndex !== -1) {
    return nextList;
  }

  nextList.push(normalizedFresh);
  return nextList;
}

function refreshConversation(state, messages, activeUser) {
  let currentMessages = state.chatHistory.AllMessages || [];

  messages.forEach((message) => {
    if (!isConversationMessage(message, activeUser)) return;
    currentMessages = integrateMessage(currentMessages, message, activeUser);
  });

  state.chatHistory.AllMessages = currentMessages;
  renderChatBody(state);
}

function renderChatBody(state) {
  const { chatBody } = getChatShellElements();
  if (!chatBody) return;

  if (!state.activeUser) {
    chatBody.innerHTML = `
      <div class="chat-placeholder">
        <p>Select a user from the list to start a private message conversation.</p>
      </div>
    `;
    return;
  }

  const messages = state.chatHistory.AllMessages || [];

  if (!messages.length) {
    chatBody.innerHTML = `
      <div class="chat-placeholder">
        <p>No messages yet. Send the first message.</p>
      </div>
    `;
    return;
  }

  chatBody.innerHTML = messages
    .map((message) => renderMessage(state.activeUser.id, message))
    .join("");

  chatBody.scrollTo({
    top: chatBody.scrollHeight,
    behavior: "smooth",
  });
}

function updateChatHeader(state) {
  const { chatName, chatStatus, messageInput, sendButton } =
    getChatShellElements();

  chatName.forEach((node) => {
    node.textContent = state.activeUser
      ? state.activeUser.user_name
      : "Select a user";
  });

  if (chatStatus) {
    chatStatus.textContent = state.activeUser
      ? state.activeUser.is_online
        ? "Online"
        : "Offline"
      : "Choose a contact to begin";
  }

  if (messageInput) {
    messageInput.disabled = !state.activeUser;
    messageInput.placeholder = state.activeUser
      ? "Type a message..."
      : "Select a user to start messaging...";
  }

  if (sendButton) {
    sendButton.disabled = !state.activeUser;
  }
}

function closeConversation() {
  const state = getState();
  state.activeUser = null;
  state.chatHistory = {
    Resc_user_name: "",
    AllMessages: [],
  };

  const page = document.querySelector(".Messages-box");
  if (page) {
    page.classList.remove("chat-open");
  }

  document.querySelectorAll(".user-row").forEach((row) => {
    row.classList.remove("active");
  });

  updateChatHeader(state);
  renderChatBody(state);
}

function setActiveUser(user) {
  const state = getState();
  state.activeUser = user;
  state.chatHistory = {
    Resc_user_name: user.user_name,
    AllMessages: [],
  };

  const page = document.querySelector(".Messages-box");
  if (page) {
    page.classList.add("chat-open");
  }

  document.querySelectorAll(".user-row").forEach((row) => {
    row.classList.toggle("active", row.dataset.id === String(user.id));
  });

  updateChatHeader(state);
  renderChatBody(state);
  fetchMessagesForUser(user);
}

async function fetchMessagesForUser(user) {
  const state = getState();

  try {
    const req = await fetch(`${API_BASE}/getcahtinfo/${user.id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const res = await req.json();

    if (!req.ok) {
      Baner(res.error, res.message);
      return;
    }

    if (!state.activeUser || String(state.activeUser.id) !== String(user.id)) {
      return;
    }

    const fetchedHistory = res.data || {
      Resc_user_name: user.user_name,
      AllMessages: [],
    };

    state.chatHistory.Resc_user_name =
      fetchedHistory.Resc_user_name || user.user_name;
    refreshConversation(state, fetchedHistory.AllMessages || [], user);
    updateChatHeader(state);
  } catch (error) {
    console.error("Failed to fetch messages:", error);
  }
}

function setupSocket() {
  const state = getState();

  if (state.ws && state.ws.readyState !== WebSocket.CLOSED) {
    state.ws.close();
  }

  const ws = new WebSocket("ws://localhost:9090/ws");
  state.ws = ws;

  ws.onmessage = (event) => {
    let incomingMsg;

    try {
      incomingMsg = JSON.parse(event.data);
    } catch (error) {
      incomingMsg = {
        content: event.data,
        sender_id: state.activeUser ? state.activeUser.id : null,
        sender_name: state.activeUser ? state.activeUser.user_name : "Message",
        create_time: new Date().toLocaleTimeString(),
      };
    }

    if (!state.activeUser || !isConversationMessage(incomingMsg, state.activeUser)) {
      return;
    }

    state.chatHistory.AllMessages = integrateMessage(
      state.chatHistory.AllMessages || [],
      incomingMsg,
      state.activeUser,
    );
    renderChatBody(state);
  };

  ws.onerror = (error) => {
    console.error("WebSocket Error Details:", error);
  };
}

async function GetUsers() {
  const state = getState();

  try {
    const res = await fetch(`${API_BASE}/getallusers`, {
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

    state.users = result.data || [];

    const cardContainer = getUsersListElement();
    if (!cardContainer) return;

    cardContainer.innerHTML = state.users
      .map(
        (user) => `
          <div class="user-row ${user.is_online ? "online" : "offline"}" data-username="${escapeHtml(user.user_name)}" data-id="${user.id}">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Avatar" class="user-avatar" />
              <div class="user-info">
                  <span class="user-name">${escapeHtml(user.user_name)}</span>
                  <span class="user-status">${user.is_online ? "Online" : ""}</span>
              </div>
          </div>
        `,
      )
      .join("");
  } catch (error) {
    console.error("Failed to load users:", error);
    Baner("Request Error", "Unable to load users right now.");
  }
}

function initPage() {
  if (!document.querySelector(".Messages-box")) {
    return;
  }

  const state = getState();
  const usersList = getUsersListElement();
  const page = document.querySelector(".Messages-box");
  const { backButton, chatForm, messageInput } = getChatShellElements();

  setupSocket();
  updateChatHeader(state);
  renderChatBody(state);

  if (usersList && !usersList.dataset.bound) {
    usersList.dataset.bound = "true";
    usersList.addEventListener("click", (event) => {
      const row = event.target.closest(".user-row");
      if (!row) return;

      const user = state.users.find(
        (item) => String(item.id) === String(row.dataset.id),
      );

      if (!user) return;
      setActiveUser(user);
    });
  }

  if (backButton && !backButton.dataset.bound) {
    backButton.dataset.bound = "true";
    backButton.addEventListener("click", () => {
      closeConversation();
    });
  }

  if (chatForm && !chatForm.dataset.bound) {
    chatForm.dataset.bound = "true";
    chatForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const currentState = getState();
      if (!currentState.activeUser) {
        Baner("Select a user first", "Choose a contact before sending a message.");
        return;
      }

      const inputElement = messageInput;
      const messageText = inputElement ? inputElement.value.trim() : "";
      if (!messageText) return;

      const payload = {
        content: messageText,
        recipient_id: Number(currentState.activeUser.id),
      };

      currentState.chatHistory.AllMessages = integrateMessage(
        currentState.chatHistory.AllMessages || [],
        {
          ...payload,
          sender_id: -1,
          sender_name: "You",
          create_time: new Date().toLocaleTimeString(),
          __optimistic: true,
        },
        currentState.activeUser,
      );
      renderChatBody(currentState);

      if (currentState.ws && currentState.ws.readyState === WebSocket.OPEN) {
        currentState.ws.send(JSON.stringify(payload));
        inputElement.value = "";
      } else {
        currentState.chatHistory.AllMessages = (
          currentState.chatHistory.AllMessages || []
        ).filter((message) => !message.__optimistic);
        renderChatBody(currentState);
        Baner("Connection Error", "WebSocket connection is closed. Try again.");
      }
    });
  }
}

export default function Messages() {
  MainHeaders();

  if (window.__messagesPageState?.ws && window.__messagesPageState.ws.readyState < WebSocket.CLOSING) {
    window.__messagesPageState.ws.close();
  }
  window.__messagesPageState = createEmptyState();

  ensureStylesheet("../../assets/styles/messages.css");
  ensureStylesheet("../../assets/styles/chat-page.css");

  NavBar();
  const page = document.querySelector(".Messages-box");
  if (page) {
    page.classList.remove("chat-open");
  }
  GetUsers();

  setTimeout(initPage, 0);

  return `
    <div class="Messages-box">
        <div id="users-list"></div>

        <div id="user-chat">
            <div class="mobile-chat-header">
                <button class="mobile-back-btn" type="button">← Back</button>
                <div class="mobile-chat-title">
                  <h4 class="chat-user-name">Select a user</h4>
                </div>
            </div>

            <main class="main-chat-window">
              <div class="chat-header">
                <div class="active-user-info">
                  <a href="#/" class="back-home-btn" title="Back to Home">
                   <i class="fa-solid fa-angle-left"></i>
                  </a>
                  
                  <div class="chat-avatar">
                    <img src="${DEFAULT_AVATAR}" alt="Avatar">
                  </div>
                  <div class="item-text">
                    <h4 class="chat-user-name">Select a user</h4>
                    <p class="status-text">
                      <span class="status-dot"></span>
                      <span class="chat-status-text">Choose a contact to begin</span>
                    </p>
                  </div>
                </div>
                
                <div class="chat-actions">
                  <button class="action-btn" type="button"><i class="ri-phone-line"></i></button>
                  <button class="action-btn" type="button"><i class="ri-vidicon-line"></i></button>
                  <button class="action-btn" type="button"><i class="ri-more-2-fill"></i></button>
                </div>
              </div>

              <div class="chat-messages-body">
                <div class="chat-placeholder">
                  <p>Select a user from the list to start a private message conversation.</p>
                </div>
              </div>

              <div class="chat-input-footer">
                <form class="chat-input-form" id="messageform">
                  <input
                    type="text"
                    name="message-content"
                    class="message-input"
                    placeholder="Select a user to start messaging..."
                    autocomplete="off"
                    disabled
                  >
                  <button type="submit" class="send-message-btn" disabled>
                    <i class="fa-regular fa-paper-plane"></i>
                  </button>
                </form>
              </div>
            </main>
        </div>
    </div>
  `;
}
