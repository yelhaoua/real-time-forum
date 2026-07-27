import {routes} from "./js/routes/routes.js";

const getPath = () => {
  const hash = window.location.hash.slice(1);
  return hash || "/";
};

const urlLocationHandler = async () => {
  const location = getPath();
  const route = routes[location] || routes[404];

  try {
    const html = await fetch(route.template).then((res) => {
      if (!res.ok)
        throw new Error(`HTTP $ {
            res.status
          }

          - Template not found`);
      return res.text();
    });

    document.getElementById("app").innerHTML = html;

    if (typeof route.init === "function") {
      await route.init();
    }

    document.title = route.title;
  } catch (err) {
    console.error("Failed to render page route:", err);
  }
};

window.addEventListener("click", (e) => {
  const anchor = e.target.closest("a");
  if (!anchor) return;

  const href = anchor.getAttribute("href");
  if (!href) return;

  if (href.startsWith("#/")) {
    e.preventDefault();
    window.location.hash = href;
  }

  if (href === "/logout") {
    e.preventDefault();
    window.location.hash = "#/logout";
  }
});

window.addEventListener("hashchange", urlLocationHandler);

window.addEventListener("DOMContentLoaded", async () => {
  
  await urlLocationHandler();
});
