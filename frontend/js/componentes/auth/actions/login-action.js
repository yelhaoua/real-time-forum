import { validateLogin } from "../../../shared/login-validatore.js";

export default async function LoginAction(e) {
  e.preventDefault();

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const errorEmail = document.getElementById("error-email");
  const errorPassword = document.getElementById("error-password");

  if (errorEmail) errorEmail.classList.add("hidden");
  if (errorPassword) errorPassword.classList.add("hidden");

  const emailValue = emailInput ? emailInput.value.trim() : "";
  const passwordValue = passwordInput ? passwordInput.value : "";

  let hasError = false;

  if (!validateLogin(emailValue)) {
    if (errorEmail) errorEmail.classList.remove("hidden");
    hasError = true;
  }

  if (passwordValue.length < 8) {
    if (errorPassword) {
      errorPassword.textContent = "Password must be at least 8 characters.";
      errorPassword.classList.remove("hidden");
    }
    hasError = true;
  }

  if (hasError) {
    return {
      success: false,
      error: "validation_error",
      message: "Please fix form errors before submitting.",
    };
  }

  const payload = {
    email: emailValue,
    pass: passwordValue,
  };

  try {
    const req = await fetch("http://localhost:9090/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const res = await req.json();

    if (!req.ok) {
      if (errorPassword) {
        errorPassword.textContent = res.message || "Authentication failed.";
        errorPassword.classList.remove("hidden");
      }
      return {
        success: false,
        error: res.error || "auth_error",
        message: res.message || "Invalid credentials",
      };
    }

    return res;
  } catch (err) {
    return {
      success: false,
      error: "server_error",
      message: "Internal server error or server is unreachable.",
    };
  }
}
