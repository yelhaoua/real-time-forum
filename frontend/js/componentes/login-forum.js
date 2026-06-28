export default function loginforum() {
  document.getElementsByTagName("title")[0].innerHTML = "01Forum | Login";
  document.getElementsByTagName("nav")[0].classList = "hidden";

  return `
   <main class="card">
    <section class="brand">
      <div class="logo">
        <svg class="mark" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="g" x1="6" y1="4" x2="34" y2="36" gradientUnits="userSpaceOnUse">
              <stop stop-color="#6FBEFF"/><stop offset="1" stop-color="#1F6FE5"/>
            </linearGradient>
          </defs>
          <path d="M20 2c.7 6.4 1.9 9.7 4.6 12.4S31.6 18.3 38 19c-6.4.7-9.7 1.9-12.4 4.6S20.7 31.6 20 38c-.7-6.4-1.9-9.7-4.6-12.4S8.4 19.7 2 19c6.4-.7 9.7-1.9 12.4-4.6S19.3 8.4 20 2Z" fill="url(#g)"/>
        </svg>
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
              <input id="email" name="email" type="email" placeholder="you@company.com" autocomplete="email" required>
            </div>
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

        <div class="divider">or continue with</div>

        <div class="socials">
          <button class="social" type="button">
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8Z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1 .7-2.4 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24Z"/><path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1Z"/><path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9Z"/></svg>
            Google
          </button>
          <button class="social" type="button">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="#111"><path d="M16.4 12.6c0-2.6 2.1-3.9 2.2-4-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.1 2.5-1.8 3-.5 7.5 1.2 10 .9 1.2 1.9 2.6 3.2 2.5 1.3-.1 1.8-.8 3.3-.8s2 .8 3.3.8 2.2-1.2 3-2.4c1-1.4 1.3-2.7 1.4-2.8-.1 0-2.6-1-2.6-3.8ZM14 4.7c.7-.8 1.1-2 1-3.2-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.3Z"/></svg>
            Apple
          </button>
        </div>

        <footer class="foot">
          <div class="foot-links">
            <a href="#">Privacy Terms</a>
            <a href="#">Advertising</a>
            <a href="#">Cookies</a>
          </div>
          <div class="copy">Talentswide © 2026</div>
        </footer>
      </div>
    </section>
  </main>
    `;
}
