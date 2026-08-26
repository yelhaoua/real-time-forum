import Banner from "../ui/baner.js";
import CheckSession from "../../shared/checkSession.js";
import RegisterAction from "../auth/actions/register-action.js";

export default async function RegisterForm() {
  // 1. Properly await session check
  await CheckSession();

  // Load stylesheet
  const styleTag = document.getElementById("dynamic_style");
  if (styleTag) {
    styleTag.href = "../../../assets/styles/login.css";
  }

  // Load template
  const response = await fetch("../../../templates/register.html");
  const html = await response.text();
  document.getElementById("app").innerHTML = html;

  // Remove nav-bar if present
  const navBar = document.getElementById("nav-bar");
  if (navBar) {
    navBar.innerHTML ="";
  }

  // Attach submit event directly to the form
  const formElement = document.getElementById("RegisterForm");
  if (formElement) {
    formElement.addEventListener("submit", handleFormSubmit);
  }
}

async function handleFormSubmit(e) {
  const res = await RegisterAction(e);
  if (!res) return;

  if (!res.success) {
    Banner(
      res.error || "Registration Failed",
      res.message || "Please fix the errors below.",
    );
    return;
  }

  Banner("Success", res.message || "Registration completed!");
  setTimeout(() => {
    window.location.hash = "#/login";
  }, 1000);
}
