import MainHeaders from "../shared/main-headers.js";
import Baner from "./ui/baner.js";

export default function registerForm() {
  // init the header in html
  MainHeaders();
  let link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "../../assets/styles/register.css";
  document.head.appendChild(link);

  // remove nav bare
  document.getElementById("nav-bar").innerHTML = "";

  document.addEventListener("submit", (e) => {
    let nameErr = document.getElementById("name-Err");
    let emailErr = document.getElementById("email-Err");
    let passErr = document.getElementById("pass-Err");
    if (e.target.id === "loginForm") {
      e.preventDefault();
      nameErr.innerHTML = "";
      emailErr.innerHTML = "";
      passErr.innerHTML = "";

      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());

      const sendData = async () => {
        try {
          const response = await fetch("http://localhost:9090/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            const res = await response.json();
            console.log(res);

            if (res.data) {
              nameErr.innerHTML = res.data.Name;
              emailErr.innerHTML = res.data.Email;
              passErr.innerHTML = res.data.Password;
            }
          } else {
            const res = await response.json();
            Baner(res.error, res.message);
            e.target.reset();

            setTimeout(() => {
              window.location.href = "/#/login";
            }, 1000);
          }
        } catch (error) {
          console.error(error);
        }
      };

      sendData();
    }
  });

  return`
    <div class="container register-shell">
      <main class="card register-card">
        <section class="brand register-brand">
          <div class="logo">
            <span class="wordmark">Zone01<span>Forum</span></span>
          </div>

          <div class="brand-body">
            <div class="eyebrow">Welcome To Your Forum</div>
            <h1>Where your network gets to work.</h1>
            <p>
              Pick up the conversation, manage your pages and projects, and keep
              your team moving, all in one place.
            </p>
          </div>
        </section>

        <section class="form-wrap register-form-wrap">
          <div class="form-inner">
            <h2 class="title">Create your account</h2>
            <p class="subtitle">
              Already have an account?
              <a href="#/login" class="nav-link">Sign in</a>
            </p>

            <form id="loginForm" novalidate>
              <div>
                <label class="field-label" for="name">Full Name</label>
                <div class="field">
                  <span class="ic"><i class="fa-regular fa-user"></i></span>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Joe Deo"
                    required
                  />
                </div>
                <span id="name-Err"></span>
              </div>

              <div>
                <label class="field-label" for="email">Email address</label>
                <div class="field">
                  <span class="ic"
                    ><i class="fa-regular fa-envelope"></i>
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@company.com"
                    autocomplete="email"
                    required
                  />
                </div>
                <span id="email-Err"></span>
              </div>

              <div>
                <label class="field-label" for="password">Password</label>
                <div class="field">
                  <span class="ic"> <i class="fa-solid fa-lock"></i></span>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    autocomplete="current-password"
                    required
                  />
                </div>
                <span id="pass-Err"></span>
              </div>

              <button class="btn" type="submit">Create account</button>
            </form>
            <div class="foot">
              <div class="copy">Created At Zone01 Oujda © 2021</div>
            </div>
          </div>
        </section>
      </main>
    </div>
`;
}
