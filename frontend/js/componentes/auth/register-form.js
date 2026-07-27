import Baner from "../ui/baner.js";
import CheckSession from "../../shared/checkSession.js";
import RegisterAction from "../auth/actions/register-action.js";

export default async function RegisterForm() {
  document.getElementById("dynamic_style").href =
    "../../../assets/styles/login.css";

  async () => {
    await CheckSession();
  };

  const html = await fetch("../../../templates/register.html").then((res) =>
    res.text(),
  );
  document.getElementById("app").innerHTML = html;
  document.getElementById("nav-bar").classList = "hidden";
  document.addEventListener("submit", async (e) => {
   

    if (e.target.id === "RegisterForm") {
      const res = await RegisterAction(e);
      console.log(res);
      
      if (!res.success) {
        Baner(res.error, res.message);
        return;
      }
      Baner(res.message);
      setTimeout(() => {
        window.location.href = "/#/login";
      }, 1000);
    }
  });
}
