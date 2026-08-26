import CheckSession from "../../shared/checkSession.js";
import Banner from "../ui/baner.js";
import LoginAction from "./actions/login-action.js";

export default async function loginforum() {
  await CheckSession();

  const styleTag = document.getElementById("dynamic_style");
  if (styleTag) {
    styleTag.href = "../../../assets/styles/login.css";
  }

  const response = await fetch("../../../templates/login.html");
  const html = await response.text();

  const appElement = document.getElementById("app");
  appElement.innerHTML = html;

  const navBar = document.getElementById("nav-bar");
  if (navBar) {
    navBar.innerHTML = "";
  }

  const loginForm = document.getElementById("LoginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleFormSubmit);
  }
}

async function handleFormSubmit(e) {
  const res = await LoginAction(e);
  if (!res) return;

  if (!res.success) {
    const errorTitle = res.error || "Login Error";
    const errorMessage = res.message || "Invalid email or password.";
    Banner(errorTitle, errorMessage);
    return;
  }

  Banner("Success", res.message || "Login successful!");
  setTimeout(() => {
    window.location.hash = "#/";
  }, 1000);
}
