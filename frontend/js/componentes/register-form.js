export default function registerForm() {
  // 1. أضفنا async للتعامل مع الـ fetch بشكل صحيح
  document.addEventListener("submit", async (e) => {
    // 2. تصحيح الـ ID ليطابق المعرّف الموجود في الـ HTML بالأسفل (loginForm)
    if (e.target.id === "loginForm") {
      e.preventDefault(); // منع إعادة تحميل الصفحة

      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());

      try {
        // 3. أضفنا await لتأكيد الإرسال في الخلفية
        const response = await fetch("http://localhost:9090/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          console.log("تم إرسال بيانات التسجيل بنجاح إلى Go!", data);
        }
      } catch (error) {
        console.error("خطأ في الاتصال بالسيرفر:", error);
      }
    }
  });

  // الـ HTML الرائع الخاص بك (مع الحفاظ على المعرف id="loginForm")
  return `
   <main class="card">
      <!-- Brand side -->
      <section class="brand">
        <div class="logo">
          <span class="wordmark">Talents<span>wide</span></span>
        </div>

        <div class="brand-body">
          <div class="eyebrow">Welcome back</div>
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
          <h2 class="title">Sign in to your account</h2>
          <p class="subtitle">
            New to Talentswide?
            <a href="/" class="nav-link">Create an account</a>
          </p>

          <form id="loginForm" novalidate>
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
                <button type="button" class="toggle" id="toggle">
                   <span class="ic"> <i class="fa-regular fa-eye"></i></span>
                </button>
              </div>
            </div>


            <button class="btn" type="submit">Sign in</button>
          </form>
          <div class="foot">
            
            <div class="copy">Created At Zone01 Oujda © 2021</div>
          </div>
        </div>
      </section>
    </main>`;
}
