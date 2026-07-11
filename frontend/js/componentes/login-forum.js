import CheckSession from "../shared/checkSession.js";
import MainHeaders from "../shared/main-headers.js";
import Baner from "./ui/baner.js";

function validateEmail(input) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(input);
}

function validateUsername(input) {
  const regex = /^[a-zA-Z0-9_]{3,20}$/;
  return regex.test(input);
}

function validateLogin(input) {
  return validateEmail(input) || validateUsername(input);
}

export default function loginforum() {
  MainHeaders();
  CheckSession();

  const head = document.head;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "../../assets/styles/login.css";
  head.appendChild(link);

  document.getElementsByTagName("title")[0].innerHTML = "01Forum | Login";
  document.getElementById("nav-bar").classList = "hidden";

  document.addEventListener("submit", async (e) => {
    if (e.target.id == "LoginForm") {
      e.preventDefault();

      const input = document.getElementById("email").value;
      if (!validateLogin(input)) {
        document.getElementById("error-email").classList.remove("hidden");
        return;
      }

      const pass = document.getElementById("password").value;
      if (pass.length < 8) {
        document.getElementById("error-password").classList.remove("hidden");
        return;
      }

      const PostData = { email: input, pass: pass };
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
        return;
      }
      Baner(res.message);
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
  });

  return `
   <main class="card auth-card">
    <section class="brand auth-brand">
      <div class="logo">
        <span class="wordmark">Zone01<span>Forum</span></span>
      </div>

      <div class="brand-body">
        <div class="eyebrow">Welcome back</div>
        <h1>Where your network gets to work.</h1>
        <p>Pick up the conversation, manage your pages and projects, and keep your team moving, all in one place.</p>
      </div>
    </section>

    <section class="form-wrap auth-form-wrap">
      <div class="form-inner">
        <h2 class="title">Sign in to your account</h2>
        <p class="subtitle">New to Talentswide? <a href="#/register" class="nav-link">Create an account</a></p>

        <form id="LoginForm" method="POST" action="#">
          <div>
            <label class="field-label" for="email">Email or Username</label>
            <div class="field">
              <span class="ic">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg>
              </span>
              <input id="email" name="email" type="text" placeholder="name@mail.com or username" autocomplete="email" required>
            </div>
            <p id="error-email" class="field-label hidden auth-error">Please enter valid email</p>
          </div>

          <div>
            <label class="field-label" for="password">Password</label>
            <div class="field">
              <span class="ic">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="4" y="10" width="16" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
              </span>
              
              <input class="pass-hidden" id="password" name="password" type="password" placeholder="Enter your password" autocomplete="current-password" required>
             
            </div>
            <p id="error-password" class="field-label hidden auth-error">Password must be at least 8 characters</p>
          </div>

     

          <button class="btn" type="submit">Sign in</button>
        </form>
        <div class="foot">
          <div class="copy">Created At Zone01 Oujda © 2021</div>
        </div>
      </div>
    </section>
  </main>
  `;
}
