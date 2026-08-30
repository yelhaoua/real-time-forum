import { Banner } from "../ui.js";
import { disconnect } from "../ws.js";

// ── Login ──────────────────────────────────────────────────────────────────

export async function LoginPage() {
  document.getElementById("nav-bar").innerHTML = "";
  document.getElementById("app").innerHTML = `
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
          <p class="subtitle">New to the forum? <a href="#/register" class="nav-link">Create an account</a></p>
          <form id="LoginForm" method="POST">
            <div>
              <label class="field-label" for="email">Email or Username</label>
              <div class="field">
                <span class="ic">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
                    <rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>
                  </svg>
                </span>
                <input id="email" name="email" type="text" placeholder="name@mail.com or username" autocomplete="email" required />
              </div>
              <p id="error-email" class="field-label hidden auth-error">Please enter valid email</p>
            </div>
            <div>
              <label class="field-label" for="password">Password</label>
              <div class="field">
                <span class="ic">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
                    <rect x="4" y="10" width="16" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>
                  </svg>
                </span>
                <input class="pass-hidden" id="password" name="password" type="password" placeholder="Enter your password" autocomplete="current-password" required />
              </div>
              <p id="error-password" class="field-label hidden auth-error">Password must be at least 8 characters</p>
            </div>
            <button class="btn" type="submit">Sign in</button>
          </form>
          <div class="foot"><div class="copy">Created At Zone01 Oujda © 2021</div></div>
        </div>
      </section>
    </main>`;

  document.getElementById("LoginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailEl = document.getElementById("email");
    const passEl = document.getElementById("password");
    const errEmail = document.getElementById("error-email");
    const errPass = document.getElementById("error-password");

    errEmail.classList.add("hidden");
    errPass.classList.add("hidden");

    const email = emailEl.value.trim();
    const pass = passEl.value;
    let hasError = false;

    if (!email.includes("@") && email.length < 3) {
      errEmail.classList.remove("hidden");
      hasError = true;
    }
    if (pass.length < 8) {
      errPass.textContent = "Password must be at least 8 characters.";
      errPass.classList.remove("hidden");
      hasError = true;
    }
    if (hasError) return;

    try {
      const req = await fetch("http://localhost:9090/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pass }),
      });
      const res = await req.json();
      if (!req.ok) {
        errPass.textContent = res.message || "Authentication failed.";
        errPass.classList.remove("hidden");
        return;
      }
      Banner("Success", res.message || "Login successful!", "success");
      setTimeout(() => { window.location.hash = "#/"; }, 800);
    } catch (err) {
      console.error("Login failed:", err);
      Banner("Error", "Failed to login. Please try again.", "error");
    }
  });
}

// ── Register ───────────────────────────────────────────────────────────────

export async function RegisterPage() {
  document.getElementById("nav-bar").innerHTML = "";
  document.getElementById("app").innerHTML = `
    <div class="container register-shell">
      <main class="card register-card">
        <section class="brand register-brand">
          <div class="logo">
            <span class="wordmark">Zone01<span>Forum</span></span>
          </div>
          <div class="brand-body">
            <div class="eyebrow">Welcome To Your Forum</div>
            <h1>Where your network gets to work.</h1>
          </div>
        </section>
        <section class="form-wrap register-form-wrap">
          <div class="form-inner">
            <h2 class="title">Create your account</h2>
            <p class="subtitle">Already have an account? <a href="#/login" class="nav-link">Sign in</a></p>
            <form id="RegisterForm" method="post">
              <div>
                <label class="field-label" for="Nickname">Nickname</label>
                <div class="field">
                  <span class="ic"><i class="fa-regular fa-user"></i></span>
                  <input id="Nickname" name="nickname" type="text" placeholder="kaito" required />
                </div>
                <span class="error" id="nickname-Err"></span>
              </div>
              <div class="fullname_holder">
                <div>
                  <label class="field-label" for="first-name">First Name</label>
                  <div class="field">
                    <span class="ic"><i class="fa-regular fa-user"></i></span>
                    <input id="first-name" name="first-name" type="text" placeholder="Joe" required />
                  </div>
                  <span class="error" id="first-name-Err"></span>
                </div>
                <div>
                  <label class="field-label" for="last-name">Last Name</label>
                  <div class="field">
                    <span class="ic"><i class="fa-regular fa-user"></i></span>
                    <input id="last-name" name="last-name" type="text" placeholder="Doe" required />
                  </div>
                  <span class="error" id="last-name-Err"></span>
                </div>
              </div>
              <div class="fullname_holder">
                <div>
                  <label class="field-label" for="user-age">Age</label>
                  <div class="field">
                    <span class="ic"><i class="fa-regular fa-user"></i></span>
                    <input id="user-age" name="user-age" type="number" min="18" max="120" placeholder="18" required />
                  </div>
                  <span class="error" id="user-age-Err"></span>
                </div>
                <div>
                  <label class="field-label" for="user-gender">Your Gender</label>
                  <div class="field select-field">
                    <span class="ic"><i class="fa-regular fa-user"></i></span>
                    <select id="user-gender" name="user-gender" required>
                      <option value="" disabled selected>Select your gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <span class="error" id="gender-Err"></span>
                </div>
              </div>
              <div>
                <label class="field-label" for="email">Email</label>
                <div class="field">
                  <span class="ic"><i class="fa-regular fa-envelope"></i></span>
                  <input id="email" name="email" type="email" placeholder="you@company.com" autocomplete="email" required />
                </div>
                <span class="error" id="email-Err"></span>
              </div>
              <div>
                <label class="field-label" for="password">Password</label>
                <div class="field">
                  <span class="ic"><i class="fa-solid fa-lock"></i></span>
                  <input id="password" name="password" type="password" placeholder="Enter your password" autocomplete="current-password" required />
                </div>
                <span class="error" id="pass-Err"></span>
              </div>
              <button class="btn" type="submit">Create account</button>
            </form>
            <div class="foot"><div class="copy">Created At Zone01 Oujda © 2021</div></div>
          </div>
        </section>
      </main>
    </div>`;

  document.getElementById("RegisterForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const fields = {
      nickNameErr: document.getElementById("nickname-Err"),
      firstNameErr: document.getElementById("first-name-Err"),
      lastNameErr: document.getElementById("last-name-Err"),
      ageErr: document.getElementById("user-age-Err"),
      genderErr: document.getElementById("gender-Err"),
      emailErr: document.getElementById("email-Err"),
      passErr: document.getElementById("pass-Err"),
    };

    Object.values(fields).forEach((el) => { if (el) el.innerHTML = ""; });

    const age = parseInt(document.getElementById("user-age").value, 10);
    if (isNaN(age) || age < 18) {
      if (fields.ageErr) fields.ageErr.innerHTML = "You must be at least 18 years old";
      return;
    }

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const req = await fetch("http://localhost:9090/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      const res = await req.json();

      if (!req.ok) {
        if (res.message === "login") {
          window.location.hash = "#/";
          return;
        }
        if (res.data) {
          if (fields.nickNameErr) fields.nickNameErr.innerHTML = res.data.nickname || "";
          if (fields.firstNameErr) fields.firstNameErr.innerHTML = res.data.first_name || "";
          if (fields.lastNameErr) fields.lastNameErr.innerHTML = res.data.last_name || "";
          if (fields.ageErr) fields.ageErr.innerHTML = res.data.age || res.data.birthdate || "";
          if (fields.genderErr) fields.genderErr.innerHTML = res.data.gender || "";
          if (fields.emailErr) fields.emailErr.innerHTML = res.data.email || "";
          if (fields.passErr) fields.passErr.innerHTML = res.data.password || "";
        }
        Banner(res.error || "Registration Failed", res.message || "Please fix the errors below.", "error");
        return;
      }

      Banner("Success", res.message || "Registration completed!", "success");
      setTimeout(() => { window.location.hash = "#/login"; }, 800);
    } catch (err) {
      console.error("Register error:", err);
      Banner("Error", "Failed to register. Please try again.", "error");
    }
  });
}

// ── Logout ─────────────────────────────────────────────────────────────────

export async function LogoutPage() {
  try {
    disconnect();
    const res = await fetch("http://localhost:9090/logout", {
      method: "POST",
      credentials: "include",
    });
    if (res.ok) window.location.hash = "#/login";
  } catch (err) {
    console.error(err);
    Banner("Error", "Logout failed.", "error");
  }
}
