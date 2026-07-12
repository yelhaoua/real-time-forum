import Baner from "../ui/baner.js";
import CheckSession from "../../shared/checkSession.js";
import MainHeaders from "../../shared/main-headers.js";
import RegisterAction from "../auth/actions/register-action.js";

export default function RegisterForm() {
  // init the header in html
  MainHeaders();
  async () => {
    await CheckSession();
  };

  let link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "../../assets/styles/register.css";
  document.head.appendChild(link);

  document.getElementById("nav-bar").innerHTML = "";

  document.addEventListener("submit", async (e) => {
    const res = await RegisterAction(e);

    if (!res.success) {
      Baner(res.error, res.message);
      return;
    }
    Baner(res.message);
    setTimeout(() => {
      window.location.href = "/#/login";
    }, 1000);
  });

  return `
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
                <label class="field-label" for="Nickname">Nickname</label>
                <div class="field">
                  <span class="ic"><i class="fa-regular fa-user"></i></span>
                  <input
                    id="Nickname"
                    name="Nickname"
                    type="text"
                    placeholder="kaito"
                    required
                  />
                </div>
                <span class="inputes_Err" id="nickname-Err"></span>
              </div>


              <div>
                <label class="field-label" for="first-name">First Name</label>
                <div class="field">
                  <span class="ic"><i class="fa-regular fa-user"></i></span>
                  <input
                    id="first-name"
                    name="first-name"
                    type="text"
                    placeholder="Joe Deo"
                    required
                  />
                </div>
                <span class="inputes_Err" id="first-name-Err"></span>
              </div>


              <div>
                <label class="field-label" for="last-name">Last Name</label>
                <div class="field">
                  <span class="ic"><i class="fa-regular fa-user"></i></span>
                  <input
                    id="last-name"
                    name="last-name"
                    type="text"
                    placeholder="Joe Deo"
                    required
                  />
                </div>
                <span class="inputes_Err" id="last-name-Err"></span>
              </div>

              <div>
                <label class="field-label" for="email">Email</label>
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
                <span class="inputes_Err" id="email-Err"></span>
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
                <span class="inputes_Err" id="pass-Err"></span>
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
