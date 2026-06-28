import Baner from "./ui/baner.js";

export default function registerForm() {
  document.addEventListener("submit", (e) => {
    let nameErr = document.getElementById("name-Err");
    let emailErr = document.getElementById("email-Err");
    let passErr = document.getElementById("pass-Err");
    if (e.target.id === "loginForm") {
      e.preventDefault();
      e.stopPropagation();
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
            console.log("Hna");

            const res = await response.json();
            console.log(res);

            if (res.Data) {
              nameErr.innerHTML = res.Data.Name;
              emailErr.innerHTML = res.Data.Email;
              passErr.innerHTML = res.Data.Password;
            }
          } else {
            const res = await response.json();
            const bannerElement = Baner(res.Message, res.Message);
            let succesMessage = document.getElementById("succes-Message");

            if (succesMessage) {
              succesMessage.remove();
            }

            document.body.appendChild(bannerElement);

            e.target.reset();
          }
        } catch (error) {
          console.error(error);
        }
      };

      sendData();
    }
  });

  return `
  
   <main class="card">
      <!-- Brand side -->
      
      <section class="brand">
        <div class="logo">
          <span class="wordmark">Zone01<span>Forum</span></span>
        </div>

        <div class="brand-body">
          <div class="eyebrow">Welcome To Your Forum</div>
          <h1>Where your network gets to work.</h1>
          <p>
            Pick up the conversation, manage your pages and projects, and keep
            your team moving — all in one place.
          </p>
        </div>
      </section>

      <!-- Form side -->
      <section class="form-wrap">
        <div class="form-inner">
          <h2 class="title">Register in to your account</h2>
          <p class="subtitle">
            Sign Ins to Your Account?
            <a href="#/login" class="nav-link">Sign In</a>
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
              <span id="name-Err" ></span>
            </div>

            <div>
              <label class="field-label" for="email">Email address</label>
              <div class="field">
                <span class="ic"><i class="fa-regular fa-envelope"></i> </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  autocomplete="email"
                  required
                />
              </div>
              <span id="email-Err" ></span>
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
               <span id="pass-Err" ></span>
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
