import escapeHtml from "../shared/formate-text.js";
import MainHeaders from "../shared/main-headers.js";
import NavBar from "./nave-bare.js";
import Baner from "./ui/baner.js";
import wsProvider from "../shared/ws-provider.js";

const MSG_LIMIT = 10;

function createEmptyState() {
  return { users: [], activeUser: null, chatHistory: { Resc_user_name: "", AllMessages: [] }, ws: null, offset: 0, allLoaded: false, loadingMore: false };
}

function getState() {
  return (window.__messagesPageState ??= createEmptyState());
}

function getChatShellElements() {
  return {
    page:         document.querySelector(".Messages-box"),
    chatName:     document.querySelectorAll("#user-chat .chat-user-name"),
    chatStatus:   document.querySelector("#user-chat .chat-status-text"),
    chatBody:     document.querySelector("#user-chat .chat-messages-body"),
    chatForm:     document.querySelector("#user-chat #messageform"),
    messageInput: document.querySelector("#user-chat .message-input"),
    sendButton:   document.querySelector("#user-chat .send-message-btn"),
    backButton:   document.querySelector("#user-chat .mobile-back-btn"),
  };
}

function renderMessage(activeUserId, msg) {
  const incoming = String(msg.sender_id) === String(activeUserId);
  const name    = escapeHtml(msg.sender_name || (incoming ? "" : "You"));
  const content = escapeHtml(msg.content || "");
  const time    = escapeHtml(msg.creat_time || msg.create_time || "");
  const avatar  = msg.sender_avatar || "../../assets/images/download.jpeg";

  if (incoming) {
    return `
      <div class="message-row incoming">
        <div class="chat-avatar msg-avatar"><img src="${avatar}" alt="Avatar"></div>
        <div>
          <h5>${name}</h5>
          <div class="message-content"><p>${content}</p><span class="message-time">${time}</span></div>
        </div>
      </div>`;
  }

  return `
    <div class="message-row outgoing">
      <div style="text-align:right">
        <h5>${name}</h5>
        <div class="message-content"><div><p>${content}</p><span class="message-time">${time}</span></div></div>
      </div>
    </div>`;
}

function normalizeMessage(message, activeUser) {
  const msg = { ...message };
  const isIncoming = activeUser && String(msg.sender_id) === String(activeUser.id);

  if (!msg.sender_name) msg.sender_name = isIncoming ? activeUser?.user_name || "" : "You";

  if (!msg.create_time && !msg.creat_time && msg.timestamp) {
    msg.create_time = new Date(msg.timestamp).toLocaleTimeString();
  }

  return msg;
}

function isConversationMessage(message, user) {
  if (!message || !user) return false;
  const sid = String(message.sender_id ?? "");
  const rid = String(message.recipient_id ?? "");
  const uid = String(user.id);
  return sid === uid || rid === uid;
}

function integrateMessage(list, freshMessage, activeUser) {
  const msg  = normalizeMessage(freshMessage, activeUser);
  const next = [...list];

  const optimisticIdx = next.findIndex(
    (m) => m.__optimistic && m.content === msg.content && String(m.recipient_id ?? "") === String(msg.recipient_id ?? ""),
  );

  if (optimisticIdx !== -1) {
    next[optimisticIdx] = { ...msg };
    delete next[optimisticIdx].__optimistic;
    return next;
  }

  const duplicate = next.some(
    (m) =>
      String(m.sender_id ?? "") === String(msg.sender_id ?? "") &&
      String(m.recipient_id ?? "") === String(msg.recipient_id ?? "") &&
      m.content === msg.content &&
      (m.create_time || m.creat_time || "") === (msg.create_time || msg.creat_time || ""),
  );

  if (!duplicate) next.push(msg);
  return next;
}


function renderChatBody(state, autoScroll = true) {
  const { chatBody } = getChatShellElements();
  if (!chatBody) return;

  const messages = state.chatHistory.AllMessages || [];

  if (!state.activeUser || !messages.length) {
    chatBody.innerHTML = `<div class="chat-placeholder"><p>${
      state.activeUser ? "No messages yet. Send the first message." : "Select a user from the list to start a private message conversation."
    }</p></div>`;
    return;
  }

  chatBody.innerHTML = messages.map((m) => renderMessage(state.activeUser.id, m)).join("");
  if (autoScroll) chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
}

function updateChatHeader(state) {
  const { chatName, chatStatus, messageInput, sendButton } = getChatShellElements();
  const user = state.activeUser;

  chatName.forEach((n) => { n.textContent = user ? user.user_name : "Select a user"; });

  if (chatStatus) chatStatus.textContent = user ? (user.is_online ? "Online" : "Offline") : "Choose a contact to begin";
  if (messageInput) {
    messageInput.disabled = !user;
    messageInput.placeholder = user ? "Type a message..." : "Select a user to start messaging...";
  }
  if (sendButton) sendButton.disabled = !user;
}

function selectUser(user) {
  const state = getState();
  state.activeUser = user ?? null;
  state.chatHistory = { Resc_user_name: user?.user_name ?? "", AllMessages: [] };
  state.offset = 0;
  state.allLoaded = false;
  state.loadingMore = false;

  document.querySelector(".Messages-box")?.classList.toggle("chat-open", !!user);
  document.querySelectorAll(".user-row").forEach((row) =>
    row.classList.toggle("active", !!user && row.dataset.id === String(user.id)),
  );

  updateChatHeader(state);
  renderChatBody(state);
  if (user) fetchMessagesForUser(user);
}

// ── Data fetching ─────────────────────────────────────────────────────────────

async function fetchMessagesForUser(user, offset = 0) {
  const state = getState();
  try {
    const req = await fetch(`http://localhost:9090/getcahtinfo/${user.id}?limit=${MSG_LIMIT}&offset=${offset}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const res = await req.json();

    if (!req.ok) { Baner(res.error, res.message); return; }
    if (!state.activeUser || String(state.activeUser.id) !== String(user.id)) return;

    const history = res.data || { Resc_user_name: user.user_name, AllMessages: [] };
    state.chatHistory.Resc_user_name = history.Resc_user_name || user.user_name;

    const incoming = history.AllMessages || [];
    if (incoming.length < MSG_LIMIT) state.allLoaded = true;

    if (offset === 0) {
      incoming.forEach((msg) => {
        if (!isConversationMessage(msg, user)) return;
        state.chatHistory.AllMessages = integrateMessage(state.chatHistory.AllMessages, msg, user);
      });
      updateChatHeader(state);
      renderChatBody(state);
    } else {
      const { chatBody } = getChatShellElements();
      const prevHeight = chatBody ? chatBody.scrollHeight : 0;
      incoming.forEach((msg) => {
        if (!isConversationMessage(msg, user)) return;
        state.chatHistory.AllMessages = [normalizeMessage(msg, user), ...state.chatHistory.AllMessages];
      });
      renderChatBody(state, false);
      if (chatBody) chatBody.scrollTop = chatBody.scrollHeight - prevHeight;
    }
  } catch (err) {
    console.error("Failed to fetch messages:", err);
  } finally {
    state.loadingMore = false;
  }
}

async function fetchUsers() {
  const state = getState();
  try {
    const res = await fetch(`http://localhost:9090/getallusers`, { method: "GET", credentials: "include", headers: { "Content-Type": "application/json" } });
    const result = await res.json();

    if (!res.ok) { Baner(result.error, result.message); return; }

    state.users = result.data || [];
    const list = document.querySelector("#users-list");
    if (!list) return;

    if (!state.users.length) {
      list.innerHTML = `
        <div class="users-empty-state">
          <div class="users-empty-icon">
            <i class="fa-regular fa-comments"></i>
          </div>
          <h3 class="users-empty-title">No users yet</h3>
          <p class="users-empty-desc">When other people join the forum, they'll appear here and you can start a conversation.</p>
        </div>`;
      return;
    }

    list.innerHTML = state.users.map((u) => `
      <div class="user-row ${u.is_online ? "online" : "offline"}" data-username="${escapeHtml(u.user_name)}" data-id="${u.id}">
        <div class="user-avatar-wrap">
          <img src="../../assets/images/download.jpeg" alt="Avatar" class="user-avatar">
          <span class="online-dot"></span>
        </div>
        <div class="user-info">
          <span class="user-name">${escapeHtml(u.user_name)}</span>
          <span class="user-status">${u.is_online ? "Online" : "Offline"}</span>
        </div>
      </div>`).join("");
  } catch (err) {
    console.error("Failed to load users:", err);
    Baner("Request Error", "Unable to load users right now.");
  }
}


// WS message handler — registered while the messages page is mounted
function onChatMessage(msg) {
  const state = getState();
  if (!state.activeUser || !isConversationMessage(msg, state.activeUser)) return;
  state.chatHistory.AllMessages = integrateMessage(state.chatHistory.AllMessages || [], msg, state.activeUser);
  renderChatBody(state);
}

function initPage() {
  if (!document.querySelector(".Messages-box")) return;

  const state = getState();
  const { backButton, chatForm, messageInput } = getChatShellElements();
  const usersList = document.querySelector("#users-list");

  wsProvider.on("message", onChatMessage);
  updateChatHeader(state);
  renderChatBody(state);

  const { chatBody } = getChatShellElements();
  if (chatBody && !chatBody.dataset.bound) {
    chatBody.dataset.bound = "true";
    chatBody.addEventListener("scroll", () => {
      const s = getState();
      if (chatBody.scrollTop > 0 || !s.activeUser || s.allLoaded || s.loadingMore) return;
      s.loadingMore = true;
      s.offset += MSG_LIMIT;
      fetchMessagesForUser(s.activeUser, s.offset);
    });
  }

  if (usersList && !usersList.dataset.bound) {
    usersList.dataset.bound = "true";
    usersList.addEventListener("click", (e) => {
      const row = e.target.closest(".user-row");
      if (!row) return;
      const user = state.users.find((u) => String(u.id) === String(row.dataset.id));
      if (user) selectUser(user);
    });
  }

  if (backButton && !backButton.dataset.bound) {
    backButton.dataset.bound = "true";
    backButton.addEventListener("click", () => selectUser(null));
  }

  if (chatForm && !chatForm.dataset.bound) {
    chatForm.dataset.bound = "true";
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const currentState = getState();
      if (!currentState.activeUser) { Baner("Select a user first", "Choose a contact before sending a message."); return; }

      const text = messageInput?.value.trim();
      if (!text) return;

      const payload = { content: text, recipient_id: Number(currentState.activeUser.id) };

      currentState.chatHistory.AllMessages = integrateMessage(
        currentState.chatHistory.AllMessages || [],
        { ...payload, sender_id: -1, sender_name: "You", create_time: new Date().toLocaleTimeString(), __optimistic: true },
        currentState.activeUser,
      );
      renderChatBody(currentState);

      if (wsProvider.send(payload)) {
        messageInput.value = "";
      } else {
        currentState.chatHistory.AllMessages = (currentState.chatHistory.AllMessages || []).filter((m) => !m.__optimistic);
        renderChatBody(currentState);
        Baner("Connection Error", "WebSocket connection is closed. Try again.");
      }
    });
  }
}

export default function Messages() {
  MainHeaders();

  // Unsubscribe any previous mount's handler before resetting state
  wsProvider.off("message", onChatMessage);
  window.__messagesPageState = createEmptyState();

  for (const href of ["../../assets/styles/messages.css", "../../assets/styles/chat-page.css"]) {
    if (!document.querySelector(`link[href="${href}"]`)) {
      Object.assign(document.head.appendChild(document.createElement("link")), { rel: "stylesheet", href });
    }
  }

  NavBar();
  document.querySelector(".Messages-box")?.classList.remove("chat-open");
  fetchUsers();
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
              <a href="#/" class="back-home-btn" title="Back to Home"><i class="fa-solid fa-angle-left"></i></a>
              <div class="chat-avatar"><img src="../../assets/images/download.jpeg" alt="Avatar"></div>
              <div class="item-text">
                <h4 class="chat-user-name">Select a user</h4>
                <p class="status-text"><span class="status-dot"></span><span class="chat-status-text">Choose a contact to begin</span></p>
              </div>
            </div>
            <div class="chat-actions">
              <button class="action-btn" type="button"><i class="ri-phone-line"></i></button>
              <button class="action-btn" type="button"><i class="ri-vidicon-line"></i></button>
              <button class="action-btn" type="button"><i class="ri-more-2-fill"></i></button>
            </div>
          </div>

          <div class="chat-messages-body">
            <div class="chat-placeholder"><p>Select a user from the list to start a private message conversation.</p></div>
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
}
