import { escapeHtml, Banner } from "../ui.js";
import { off, on, send } from "../ws.js";
import NavBar from "../nav.js";
import { createUsersList } from "../shared/users-list.js";

const MSG_LIMIT = 10;

let currentCleanup = null;

export default function MessagesPage(params = {}) {
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  NavBar();

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
              <div class="chat-avatar"><img src="/assets/images/download.jpeg" alt="Avatar"></div>
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
              <input type="text" name="message-content" class="message-input" maxlength="100" placeholder="Select a user to start messaging..." autocomplete="off" disabled>
              <button type="submit" class="send-message-btn" disabled><i class="fa-regular fa-paper-plane"></i></button>
            </form>
          </div>
        </main>
      </div>
    </div>`;

  let activeUser = null;
  let allMessages = [];
  let offset = 0;
  let allLoaded = false;
  let loadingMore = false;

  const el = {
    usersList: document.querySelector("#users-list"),
    chatNames: document.querySelectorAll("#user-chat .chat-user-name"),
    chatStatus: document.querySelector("#user-chat .chat-status-text"),
    chatBody: document.querySelector("#user-chat .chat-messages-body"),
    chatForm: document.querySelector("#user-chat #messageform"),
    messageInput: document.querySelector("#user-chat .message-input"),
    sendButton: document.querySelector("#user-chat .send-message-btn"),
    backButton: document.querySelector("#user-chat .mobile-back-btn"),
  };

  function formatTimestamp(ts) {
    let date;
    try {
      date = new Date(ts);
      if (isNaN(date.getTime())) date = new Date();
    } catch {
      date = new Date();
    }

    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return "now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (now.toDateString() === date.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (yesterday.toDateString() === date.toDateString()) return "Yesterday";
    const daysDiff = Math.floor(diff / 86400);
    if (daysDiff < 7) return date.toLocaleDateString([], { weekday: "short" });
    return date.toLocaleDateString();
  }

  function msgHTML(msg) {
    const incoming = String(msg.sender_id) === String(activeUser?.id);
    const name = escapeHtml(msg.sender_name || (incoming ? "" : "You"));
    const content = escapeHtml(msg.content || "");
    const time = escapeHtml(
      formatTimestamp(
        msg.create_time || msg.creat_time || new Date().toISOString(),
      ),
    );

    if (incoming) {
      return `
        <div class="message-row incoming" data-temp-id="${msg.temp_id || ""}">
          <div class="chat-avatar msg-avatar"><img src="/assets/images/download.jpeg" alt="Avatar"></div>
          <div class="message-bubble incoming-bubble">
            <div class="message-meta"><h5>${name}</h5><span class="message-time">${time}</span></div>
            <div class="message-content"><p>${content}</p></div>
          </div>
        </div>`;
    }
    return `
      <div class="message-row outgoing" data-temp-id="${msg.temp_id || ""}">
        <div style="text-align:right">
          <div class="message-bubble outgoing-bubble">
            <div class="message-meta"><span class="message-time">${time}</span><h5>${name}</h5></div>
            <div class="message-content"><div><p>${content}</p></div></div>
          </div>
        </div>
      </div>`;
  }

  function appendMsg(msg) {
    if (!el.chatBody) return;
    el.chatBody.querySelector(".chat-placeholder")?.remove();
    if (msg.temp_id) {
      const existing = el.chatBody.querySelector(
        `[data-temp-id="${msg.temp_id}"]`,
      );
      if (existing) {
        existing.outerHTML = msgHTML(msg);
        return;
      }
    }
    el.chatBody.insertAdjacentHTML("beforeend", msgHTML(msg));
    el.chatBody.scrollTo({ top: el.chatBody.scrollHeight, behavior: "smooth" });
  }

  function renderChat() {
    if (!el.chatBody) return;
    if (!activeUser || !allMessages.length) {
      el.chatBody.innerHTML = `<div class="chat-placeholder"><p>${
        activeUser
          ? "No messages yet. Send the first message."
          : "Select a user to start a conversation."
      }</p></div>`;
      return;
    }
    el.chatBody.innerHTML = allMessages.map(msgHTML).join("");
    el.chatBody.scrollTo({
      top: el.chatBody.scrollHeight,
      behavior: "instant",
    });
  }

  function updateHeader() {
    el.chatNames.forEach((n) => {
      n.textContent = activeUser ? activeUser.user_name : "Select a user";
    });
    if (el.chatStatus) {
      el.chatStatus.textContent = activeUser
        ? activeUser.is_online
          ? "Online"
          : "Offline"
        : "Choose a contact to begin";
      const dot = document.querySelector("#user-chat .status-dot");
      if (dot) dot.classList.toggle("online", !!activeUser?.is_online);
    }
    if (el.messageInput) {
      el.messageInput.disabled = !activeUser;
      el.messageInput.placeholder = activeUser
        ? "Type a message..."
        : "Select a user to start messaging...";
    }
    if (el.sendButton) el.sendButton.disabled = !activeUser;
  }

  async function fetchMessages(targetOffset = 0) {
    if (!activeUser) return;
    try {
      const res = await fetch(
        `http://localhost:9090/getchatinfo/${activeUser.id}?limit=${MSG_LIMIT}&offset=${targetOffset}`,
        { method: "GET", credentials: "include" },
      );
      const result = await res.json();
      if (!res.ok) {
        Banner(result.error, result.message, "error");
        return;
      }

      const incoming = result.data?.AllMessages || [];
      if (incoming.length < MSG_LIMIT) allLoaded = true;

      if (targetOffset === 0) {
        allMessages = incoming;
        renderChat();
      } else {
        const prevH = el.chatBody?.scrollHeight || 0;
        allMessages = [...incoming, ...allMessages];
        renderChat();
        if (el.chatBody)
          el.chatBody.scrollTop = el.chatBody.scrollHeight - prevH;
      }
    } catch (err) {
      console.error("Failed fetching chat history:", err);
      Banner("Error", "Failed to fetch chat history.", "error");
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
    updateHeader();
    renderChat();
    usersList.refresh();

    if (user) {
      usersList.markActiveUserRead(user.id);
      fetchMessages(0);
    }
  }

  function onChatMessage(msg) {
    if (!activeUser) return;
    const sid = String(msg.sender_id ?? "");
    const rid = String(msg.recipient_id ?? "");
    const uid = String(activeUser.id);
    if (sid !== uid && rid !== uid) return;
    allMessages.push(msg);
    appendMsg(msg);

    if (sid === uid) {
      usersList.markActiveUserRead(activeUser.id);
    }
  }

  function handleScroll() {
    if (
      !el.chatBody ||
      el.chatBody.scrollTop > 0 ||
      !activeUser ||
      allLoaded ||
      loadingMore
    )
      return;
    loadingMore = true;
    offset += MSG_LIMIT;
    fetchMessages(offset);
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!activeUser) {
      Banner(
        "Select a user first",
        "Choose a contact before sending.",
        "warning",
      );
      return;
    }
    const text = el.messageInput?.value.trim();
    if (!text) return;

    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();
    const payload = {
      content: text,
      recipient_id: Number(activeUser.id),
      temp_id: tempId,
    };
    const optimisticMsg = {
      ...payload,
      sender_id: -1,
      sender_name: "You",
      create_time: nowIso,
    };

    allMessages.push(optimisticMsg);
    appendMsg(optimisticMsg);
    el.messageInput.value = "";
    usersList.bumpLastMessage(activeUser.id, nowIso);

    if (!(await send(payload))) {
      allMessages = allMessages.filter((m) => m.temp_id !== tempId);
      el.chatBody?.querySelector(`[data-temp-id="${tempId}"]`)?.remove();
      Banner(
        "Connection Error",
        "WebSocket connection is closed. Try again.",
        "error",
      );
    }
  }

  const usersList = createUsersList({
    container: el.usersList,
    getActiveId: () => activeUser?.id ?? null,
    onSelect: (user) => selectUser(user),
    onPresenceChange: (id, isOnline) => {
      if (activeUser && String(activeUser.id) === String(id)) {
        activeUser.is_online = isOnline;
        updateHeader();
      }
    },
    onError: (message) => Banner("Request Error", message, "error"),
  });

  usersList.ready.then(() => {
    if (!params.id) return;
    const preselected = usersList.findUser(params.id);
    if (preselected) selectUser(preselected);
  });

  on("message", onChatMessage);
  el.chatBody?.addEventListener("scroll", handleScroll);
  el.chatForm?.addEventListener("submit", handleSend);
  el.backButton?.addEventListener("click", () => selectUser(null));

  currentCleanup = () => {
    off("message", onChatMessage);
    usersList.destroy();
    el.chatBody?.removeEventListener("scroll", handleScroll);
    el.chatForm?.removeEventListener("submit", handleSend);
  };
}
