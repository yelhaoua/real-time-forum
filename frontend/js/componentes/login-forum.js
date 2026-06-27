export default function loginforum () {
    document.getElementsByTagName("title")[0].innerHTML = "Login Page"
    document.getElementsByTagName("nav")[0].classList = "hidden"
    
    
    return `
    <div class="container">

    <div class="form-side">
      <div class="brand">
        <div style="width:32px; height:32px; display:flex; align-items:center; justify-content:center; color:#2D6FF3;">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19" stroke="#2D6FF3" stroke-width="2.4" stroke-linecap="round"></path>
          </svg>
        </div>
        <span class="brand-title">ForumYo</span>
      </div>

      <div class="header-text">
        <h1>Welcome back</h1>
        <p>Sign in to pick up where you left off.</p>
      </div>

      <form class="login-form" action="#" method="POST">
        <div class="input-wrapper">
          <span>Email address</span>
          <div class="input-field">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="18" height="14" rx="3" stroke="#9AA3B2" stroke-width="1.8"></rect>
              <path d="M4 7l8 6 8-6" stroke="#9AA3B2" stroke-width="1.8" stroke-linecap="round"></path>
            </svg>
            <input type="email" placeholder="you@example.com" required>
          </div>
        </div>

        <div class="input-wrapper password-container">
          <span>Password</span>
          <div class="input-field">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="11" width="14" height="9" rx="2.5" stroke="#9AA3B2" stroke-width="1.8"></rect>
              <path d="M8 11V8a4 4 0 018 0v3" stroke="#9AA3B2" stroke-width="1.8" stroke-linecap="round"></path>
            </svg>
            <input type="password" id="password" placeholder="••••••••" required>
          </div>
        </div>

        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox">
            Remember me
          </label>
          <a href="#" class="forgot-link">Forgot password?</a>
        </div>

        <button type="submit" class="submit-btn">Sign in</button>
      </form>

      <div class="divider">
        <div class="divider-line"></div>
        <span class="divider-text">or continue with</span>
        <div class="divider-line"></div>
      </div>

      <div class="social-row">
        <button type="button" class="social-btn">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#1DA1F2" d="M23 4.9c-.8.4-1.7.6-2.6.8 1-.6 1.6-1.5 2-2.6-.9.5-1.9.9-3 1.1A4.5 4.5 0 0011.6 8c0 .4 0 .7.1 1A12.8 12.8 0 012.4 4.3a4.5 4.5 0 001.4 6 4.4 4.4 0 01-2-.6v.1c0 2.2 1.5 4 3.6 4.4a4.5 4.5 0 01-2 .1 4.5 4.5 0 004.2 3.1A9 9 0 011 19.5 12.7 12.7 0 007.9 21.5c8.2 0 12.7-6.8 12.7-12.7v-.6c.9-.6 1.6-1.4 2.2-2.3z"></path>
          </svg>
          Twitter
        </button>
        <button type="button" class="social-btn">
          <svg width="17" height="17" viewBox="0 0 24 24">
            <path fill="#111" d="M16.4 12.6c0-2.2 1.8-3.3 1.9-3.3-1-1.5-2.6-1.7-3.2-1.7-1.3-.1-2.6.8-3.3.8-.7 0-1.7-.8-2.8-.8-1.4 0-2.7.8-3.5 2.1-1.5 2.6-.4 6.4 1 8.5.7 1 1.5 2.2 2.6 2.1 1-.04 1.4-.7 2.7-.7 1.2 0 1.6.7 2.7.6 1.1-.02 1.8-1 2.5-2 .8-1.2 1.1-2.3 1.1-2.4-.02-.01-2.1-.8-2.1-3.3zM14.3 5.8c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.5.6-1 1.6-.9 2.6 1 .1 2-.5 2.5-1.2z"></path>
          </svg>
          Apple
        </button>
      </div>

      <p class="footer-text">Don't have an account? <a href="./register">Sign up</a></p>
    </div>

    <div class="visual-side">
      <div class="circle-top"></div>
      <div class="circle-bottom"></div>

      <div class="status-badge">
        <span class="status-dot"></span>
        12,400+ teams online now
      </div>

      <div class="visual-content">
        <h2>Your network,<br>all in one place.</h2>
        <p>Connect with people, manage your pages and projects, and stay on top of what matters.</p>

      </div>
    </div>

  </div>`
}