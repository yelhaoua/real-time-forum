import Banner from "../ui/baner.js";
import CheckSession from "../../shared/checkSession.js";
import RegisterAction from "../auth/actions/register-action.js";

export default async function RegisterForm() {
  await CheckSession();

  const styleTag = document.getElementById("dynamic_style");
  if (styleTag) {
    styleTag.href = "../../../assets/styles/login.css";
  }

  const response = await fetch("../../../templates/register.html");
  const html = await response.text();
  document.getElementById("app").innerHTML = html;

  const navBar = document.getElementById("nav-bar");
  if (navBar) {
    navBar.innerHTML ="";
  }

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
      res.message || "Please fix the errors below.", "error"
    );
    return;
  }

  Banner("Success", res.message || "Registration completed!" , "success");
  setTimeout(() => {
    window.location.hash = "#/login";
  }, 1000);
}
