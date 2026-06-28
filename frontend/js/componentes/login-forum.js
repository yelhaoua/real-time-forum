function validateEmail(email) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}

export default function loginforum() {
  document.getElementsByTagName("title")[0].innerHTML = "01Forum | Login";
  const head = document.querySelector("head");

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "./assets/styles/login.css";
  head.appendChild(link);

  // document.getElementsByTagName("nav")[0].classList = "hidden";

  document.addEventListener("submit", async (e) => {
    if (e.target.id == "loginForm") {
      e.preventDefault();

      const email = document.getElementById("email").value;
      if (!validateEmail(email)) {
        document.getElementById("error-email").classList.remove("hidden")
        return
      }

      const pass = document.getElementById("password").value;
      if (pass.length < 8 ) {
        document.getElementById("error-password").classList.remove("hidden")
        return
      }

      const PostData = { email: email, pass: pass };

      try {
        const res = await fetch("http://localhost:9090/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(PostData),
        });
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        if (res.ok) {
          window.location.href = "/";
        }
      } catch (error) {
        console.error("Error sending data:", error);
      }
    }
  });

  return `
   <main class="card">
    <section class="brand">
      <div class="logo">
        <span class="wordmark">01<span>Forum</span></span>
      </div>

      <div class="brand-body">
        <div class="eyebrow">Welcome back</div>
        <h1>Where your network gets to work.</h1>
        <p>Pick up the conversation, manage your pages and projects, and keep your team moving — all in one place.</p> 
        
      </div>
    </section>

    <section class="form-wrap">
      <div class="form-inner">
        <h2 class="title">Sign in to your account</h2>
        <p class="subtitle">New to Talentswide? <a href="#/register" class="nav-link" >Create an account</a></p>

        <form id="loginForm" method="POST" action="#">
          <div>
            <label class="field-label" for="email">Email address</label>
            <div class="field">
              <span class="ic">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg>
              </span>
              <input id="email" name="email" type="email" placeholder="name@mail.com" autocomplete="email" required>
              
            </div>
            <p id="error-email" class="field-label hidden" style="color: red" >Please enter valid email</p>
          </div>

          <div>
            <label class="field-label" for="password">Password</label>
            <div class="field">
              <span class="ic">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="4" y="10" width="16" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
              </span>
              
              <input class="pass-hidden" id="password" name="password" type="password" placeholder="Enter your password" autocomplete="current-password" required>
              <input class="pass-visible" id="password-unmasked" name="password_unmasked" type="text" placeholder="Enter your password" autocomplete="off">
              
              
              <div class="toggle-container">
                <input type="checkbox" class="toggle-checkbox" aria-label="Toggle password visibility" role="switch" aria-checked="false">
                <div class="toggle-icon">
                  <svg class="eye-on" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg class="eye-off" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18"/><path d="M10.6 10.6a3 3 0 0 0 4.2 4.2"/><path d="M9.4 5.2A9.5 9.5 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-3.3 4MA6.1 6.2A16 16 0 0 0 2 12s3.5 7 10 7a9.6 9.6 0 0 0 3.2-.5"/></svg>
                </div>
              </div>
            </div>
            <p id="error-password" class="field-label hidden" style="color: red" >Password must at least 8 characters</p>
          </div>

          <div class="row">
            <label class="remember">
              <input type="checkbox" id="remember" name="remember" checked>
              <span class="box" aria-hidden="true">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2"><path d="m5 12 5 5L20 6"/></svg>
              </span>
              Keep me signed in
            </label>
            <a class="forgot" href="#">Forgot password?</a>
          </div>

          <button class="btn" type="submit">Sign in</button>
        </form>
      </div>
    </section>
  </main>
  `;
}
