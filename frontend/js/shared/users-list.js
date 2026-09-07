import { escapeHtml } from "../ui.js";
import { on, off } from "../ws.js";

// Ported from the messages page's own (already working) implementation, so
// both the chat page and the always-visible online-users panel share one copy.

export function sortUsers(list) {
  return [...list].sort((a, b) => {
    const aHas = !!(a.last_message_at && String(a.last_message_at).trim());
    const bHas = !!(b.last_message_at && String(b.last_message_at).trim());
    if (aHas !== bHas) return aHas ? -1 : 1;
    if (aHas && bHas) {
      const diff = new Date(b.last_message_at) - new Date(a.last_message_at);
      if (diff !== 0) return diff;
    }
    return (a.user_name || "").localeCompare(b.user_name || "", undefined, {
      sensitivity: "base",
    });
  });
}

export function userRowHTML(u, isActive) {
  const badge =
    u.unread_count > 0
      ? `<span class="unread-badge">${u.unread_count}</span>`
      : "";
  return `
    <div class="user-row ${u.is_online ? "online" : "offline"} ${isActive ? "active" : ""}" data-id="${u.id}">
      <div class="user-avatar-wrap">
        <img src="/assets/images/download.jpeg" alt="Avatar" class="user-avatar">
        <span class="online-dot"></span>
      </div>
      <div class="user-info">
        <span class="user-name">${escapeHtml(u.user_name)}</span>
        <span class="user-status">${u.is_online ? "Online" : "Offline"}</span>
      </div>
      ${badge}
    </div>`;
}

// options:
//   container       — element to render the rows into
//   onSelect(user)  — called when a row is clicked
//   getActiveId()   — returns the currently-open chat user's id, for highlighting
//   onPresenceChange(id, isOnline) — called after a user's online status changes
//   onError(message) — called when the initial /getallusers fetch fails
export function createUsersList({
  container,
  onSelect,
  getActiveId,
  onPresenceChange,
  onError,
} = {}) {
  let users = [];

  function renderUsers() {
    if (!container) return;
    if (!users.length) {
      container.innerHTML = `<div class="users-empty-state"><p>No users available.</p></div>`;
      return;
    }
    const activeId = getActiveId ? getActiveId() : null;
    container.innerHTML = sortUsers(users)
      .map((u) =>
        userRowHTML(u, activeId != null && String(activeId) === String(u.id)),
      )
      .join("");
  }

  function findUser(id) {
    return users.find((x) => String(x.id) === String(id));
  }

  function bumpLastMessage(userId, iso) {
    const u = findUser(userId);
    if (u) {
      u.last_message_at = iso;
      renderUsers();
    }
  }

  async function fetchUsers() {
    try {
      const res = await fetch("http://localhost:9090/getallusers", {
        method: "GET",
        credentials: "include",
      });
      const result = await res.json();
      if (!res.ok) {
        onError?.(result.message || "Unable to load user list.");
        return;
      }
      users = result.data || [];
      renderUsers();
    } catch {
      onError?.("Unable to load user list.");
    }
  }

  function markActiveUserRead(userId) {
    const u = findUser(userId);
    if (u) {
      u.unread_count = 0;
      u.has_unread = false;
    }
    renderUsers();

    fetch("http://localhost:9090/notifications/mark_read", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender_id: Number(userId) }),
    }).catch(() => {});
  }

  function onChatMessage(msg) {
    const sid = String(msg.sender_id ?? "");
    const rid = String(msg.recipient_id ?? "");
    const nowIso = msg.create_time || msg.creat_time || new Date().toISOString();
    const activeId = getActiveId ? getActiveId() : null;
    const otherId =
      activeId != null && String(activeId) === sid ? sid : sid || rid;
    bumpLastMessage(otherId, nowIso);
  }

  function onNewMessage(notification) {
    try {
      const data = notification.data || notification;
      const senderId = String(data.sender_id ?? notification.sender_id ?? "");
      const nowIso = new Date().toISOString();
      const u = findUser(senderId);
      if (u) {
        u.last_message_at = data.create_time || data.creat_time || nowIso;
        const activeId = getActiveId ? getActiveId() : null;
        if (activeId == null || String(activeId) !== senderId) {
          u.unread_count = (u.unread_count || 0) + 1;
          u.has_unread = true;
        }
        renderUsers();
      }
    } catch (err) {
      console.error("new message notification error", err);
    }
  }

  function onNewUser(payload) {
    const data = payload.data || payload;
    if (!data?.id || findUser(data.id)) return;
    users.push({ ...data, unread_count: data.unread_count || 0 });
    renderUsers();
  }

  function onUserOnline(payload) {
    const id = String(
      payload.sender_id ?? payload.user_id ?? payload.SenderID ?? "",
    );
    if (!id) return;
    const u = findUser(id);
    if (u) u.is_online = true;
    renderUsers();
    onPresenceChange?.(id, true);
  }

  function onUserOffline(payload) {
    const id = String(
      payload.sender_id ?? payload.user_id ?? payload.SenderID ?? "",
    );
    if (!id) return;
    const u = findUser(id);
    if (u) u.is_online = false;
    renderUsers();
    onPresenceChange?.(id, false);
  }

  function handleClick(e) {
    const row = e.target.closest(".user-row");
    if (!row) return;
    const user = findUser(row.dataset.id);
    if (user && onSelect) onSelect(user);
  }

  on("message", onChatMessage);
  on("new_message", onNewMessage);
  on("new_user", onNewUser);
  on("user_online", onUserOnline);
  on("user_offline", onUserOffline);
  container?.addEventListener("click", handleClick);

  const ready = fetchUsers();

  return {
    ready,
    refresh: renderUsers,
    getUsers: () => users,
    findUser,
    markActiveUserRead,
    bumpLastMessage,
    destroy() {
      off("message", onChatMessage);
      off("new_message", onNewMessage);
      off("new_user", onNewUser);
      off("user_online", onUserOnline);
      off("user_offline", onUserOffline);
      container?.removeEventListener("click", handleClick);
    },
  };
}
