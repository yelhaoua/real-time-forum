import NotFoundPage from "./js/componentes/not-found.js";
import routes from "./js/routes/routes.js";

function router() {
  const page = document.getElementById("app");

  // 1. تنظيف المسار القادم من المتصفح
  let pathe = window.location.pathname;

  // إزالة اسم المجلد "/frontend" إذا كان موجوداً في البداية لتسهيل المطابقة
  if (pathe.startsWith("/frontend")) {
    pathe = pathe.replace("/frontend", "");
  }

  // إذا كان المسار فارغاً أو ينتهي بـ index.html، نعتبره الصفحة الرئيسية "/"
  if (pathe === "/index.html" || pathe === "" || pathe === "/") {
    pathe = "/";
  }

  console.log("المسار بعد التنظيف:", pathe);

  // 2. جلب المكون المناسب بناءً على المسار النظيف
  // إذا وجد المسار في الـ routes سيجلبه، وإلا سيعرض NotFoundPage تلقائياً
  const renderComponente = routes[pathe] || NotFoundPage;

  // 3. حقن الـ HTML داخل الصفحة
  page.innerHTML = renderComponente();
}

function navigate(url) {
  // للحفاظ على كلمة /frontend في الرابط أثناء التطوير المحلي لمنع أخطاء الـ Live Server
  // نقوم بإضافتها فقط في شريط العنوان إذا كنا نطور داخل المجلد
  const currentPath = window.location.pathname;
  const base = currentPath.startsWith("/frontend") ? "/frontend" : "";

  window.history.pushState({}, "", base + url);
  router();
}

document.addEventListener("click", (e) => {
  if (e.target.matches(".nav-link")) {
    e.preventDefault();
    navigate(e.target.getAttribute("href"));
  }
});

window.addEventListener("popstate", router);
window.addEventListener("DOMContentLoaded", router);
