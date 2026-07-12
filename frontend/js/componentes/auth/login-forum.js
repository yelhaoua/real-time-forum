import CheckSession from "../../shared/checkSession.js";
import MainHeaders from "../../shared/main-headers.js";
import Baner from "../ui/baner.js";
import LoginAction from "./actions/login-action.js";


export default function loginforum() {
  MainHeaders();
  async () => {
    await CheckSession();
  };

  const head = document.head;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "../../assets/styles/login.css";
  head.appendChild(link);

  document.getElementsByTagName("title")[0].innerHTML = "01Forum | Login";
  document.getElementById("nav-bar").classList = "hidden";

  document.addEventListener("submit", async (e) => {
    const res =await  LoginAction(e);
    console.log(res);
    if (!res.success) {
      Baner(res.error, res.message);
      return;
    }
    Baner(res.message);
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
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
