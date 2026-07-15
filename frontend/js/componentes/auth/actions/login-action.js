import { validateLogin } from "../../../shared/login-validatore.js";

export default async function LoginAction(e) {
  if (e.target.id == "LoginForm") {
    e.preventDefault();

    const input = document.getElementById("email").value;
    if (!validateLogin(input)) {
      document.getElementById("error-email").classList.remove("hidden");
      return {
        success: false,
      };
    }

    const pass = document.getElementById("password").value;
    if (pass.length < 8) {
      document.getElementById("error-password").classList.remove("hidden");
      return {
        success: false,
      };
    }

    const PostData = { email: input, pass: pass };

    try {
      const req = await fetch("http://localhost:9090/login", {
        method: "POST",
        credentials: "include",

        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(PostData),
      });

      const res = await req.json();

      if (!req.ok) {
        document.getElementById("error-password").innerHTML = res.message;
        document.getElementById("error-password").classList.remove("hidden");
      }
      return res;
    } catch (error) {
      return {
        success: false,
        message: "internale server errore  or server is downe",
      };
    }
  }
}
