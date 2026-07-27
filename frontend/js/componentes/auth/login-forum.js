import CheckSession from "../../shared/checkSession.js";
import Baner from "../ui/baner.js";
import LoginAction from "./actions/login-action.js";

export default async function loginforum() {
  document.getElementById("dynamic_style").href =
    "../../../assets/styles/login.css";

  async () => {
    await CheckSession();
  };

  const html = await fetch("../../../templates/login.html").then((res) =>
    res.text(),
  );

  document.getElementById("app").innerHTML = html;

  document.getElementById("nav-bar").classList = "hidden";

  document.addEventListener("submit", async (e) => {
    if (e.target.id === "LoginForm") {
      const res = await LoginAction(e);
      console.log(res);
      if (!res.success) {
        Baner(res.error, res.message);
        return;
      }
      Baner(res.message);
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
  });
}
