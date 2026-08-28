export default async function RegisterAction(e) {
  e.preventDefault();

  const nickNameErr = document.getElementById("nickname-Err");
  const firstNameErr = document.getElementById("first-name-Err");
  const lastNameErr = document.getElementById("last-name-Err");
  const emailErr = document.getElementById("email-Err");
  const passErr = document.getElementById("pass-Err");

  const clearError = (el) => {
    if (el) el.innerHTML = "";
  };
  clearError(nickNameErr);
  clearError(firstNameErr);
  clearError(lastNameErr);
  clearError(emailErr);
  clearError(passErr);

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  data["user-age"] = parseInt(data["user-age"], 10) || 0;

  try {
    const response = await fetch("http://localhost:9090/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    const res = await response.json();

    if (!response.ok) {
      if (res.message === "login") {
        window.location.hash = "#/";
        return {
          success: false,
          error: "session_exists",
          message: "You are already logged in.",
        };
      }

      if (res.data) {
        if (nickNameErr) nickNameErr.innerHTML = res.data.nickname || "";
        if (firstNameErr) firstNameErr.innerHTML = res.data.first_name || "";
        if (lastNameErr) lastNameErr.innerHTML = res.data.last_name || "";
        if (emailErr) emailErr.innerHTML = res.data.email || "";
        if (passErr) passErr.innerHTML = res.data.password || "";
      }

      return {
        success: false,
        error: res.error || "registration_error",
        message: res.message || "Validation failed.",
      };
    }

    return res;
  } catch (error) {
    console.error("Register network error:", error);
    return {
      success: false,
      error: "server_error",
      message: "Internal server error or server is unreachable.",
    };
  }
}
