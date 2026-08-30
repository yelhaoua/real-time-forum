export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function Banner(title = "", description = "", type = "info") {
  const icons = {
    success: `<svg width="20" height="20" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`,
    warning: `<svg width="20" height="20" viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>`,
    error: `<svg width="20" height="20" viewBox="0 0 24 24"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>`,
    info: `<svg width="20" height="20" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`,
  };

  document.getElementById("app-banner")?.remove();
  if (!title && !description) return;

  const validTypes = ["success", "warning", "error", "info"];
  const bannerType = validTypes.includes(type) ? type : "info";

  const banner = document.createElement("div");
  banner.id = "app-banner";
  banner.className = `banner banner-${bannerType}`;
  banner.innerHTML = `
    <div class="banner-icon">${icons[bannerType]}</div>
    <div class="banner-content">
      ${title ? `<h3 class="banner-title">${title}</h3>` : ""}
      ${description ? `<p class="banner-description">${description}</p>` : ""}
    </div>`;

  document.body.appendChild(banner);
  setTimeout(() => banner.parentElement && banner.remove(), 4000);
}
