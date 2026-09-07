import { createUsersList } from "./shared/users-list.js";

let instance = null;

function activeIdFromHash() {
  const match = window.location.hash.match(/^#\/messages\/([^/]+)$/);
  return match ? match[1] : null;
}

function panelTemplate() {
  return `
    <div class="online-panel" id="onlinePanel">
      <button class="online-panel-toggle" id="onlinePanelToggle" type="button">
        <span class="online-panel-title"><i class="ri-group-line"></i> Online Users</span>
        <i class="ri-arrow-down-s-line online-panel-caret"></i>
      </button>
      <div class="online-panel-body" id="onlinePanelBody"></div>
    </div>`;
}

function isOnMessagesPage() {
  const path = window.location.hash.slice(1) || "/";
  return path === "/messages" || path.startsWith("/messages/");
}

function updateVisibility() {
  const root = document.getElementById("online-users-panel");
  if (root) root.hidden = isOnMessagesPage();
}

function onHashChange() {
  instance?.refresh();
  updateVisibility();
}

export function mountOnlineUsersPanel() {
  const root = document.getElementById("online-users-panel");
  if (!root || instance) {
    updateVisibility();
    return;
  }

  root.innerHTML = panelTemplate();
  const body = document.getElementById("onlinePanelBody");
  const panel = document.getElementById("onlinePanel");
  const toggle = document.getElementById("onlinePanelToggle");

  toggle?.addEventListener("click", () => panel.classList.toggle("collapsed"));

  instance = createUsersList({
    container: body,
    getActiveId: activeIdFromHash,
    onSelect: (user) => {
      window.location.hash = `#/messages/${user.id}`;
    },
  });

  window.addEventListener("hashchange", onHashChange);
  updateVisibility();
}

export function unmountOnlineUsersPanel() {
  if (!instance) return;
  window.removeEventListener("hashchange", onHashChange);
  instance.destroy();
  instance = null;
  const root = document.getElementById("online-users-panel");
  if (root) root.innerHTML = "";
}
