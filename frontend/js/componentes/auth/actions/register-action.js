export default async function RegisterAction(e) {

  
  let nickNameErr = document.getElementById("nickname-Err");
  let fristNameErr = document.getElementById("first-name-Err");
  let lastNameErr = document.getElementById("last-name-Err");
  let emailErr = document.getElementById("email-Err");
  let passErr = document.getElementById("pass-Err");
  if (e.target.id === "RegisterForm") {
    e.preventDefault();
    nickNameErr.innerHTML = "";
    fristNameErr.innerHTML = "";
    lastNameErr.innerHTML = "";
    emailErr.innerHTML = "";
    passErr.innerHTML = "";

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data["user-age"] = parseInt(data["user-age"], 10);
    try {
      const response = await fetch("http://localhost:9090/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      const res = await response.json();
      console.log(res);

      if (!response.ok) {
        if (res.message == "login") {
          window.location.href = "/";
          return {
            success: false,
            message: "you alredy have session",
          };
        }
        if (res.data) {
          nickNameErr.innerHTML = res.data.nickname ? res.data.nickname : "";
          fristNameErr.innerHTML = res.data.first_name ? res.data.first_name  : "";
          lastNameErr.innerHTML = res.data.last_name ? res.data.last_name : "";
          emailErr.innerHTML = res.data.email ? res.data.email : "";
          passErr.innerHTML = res.data.password ? res.data.password : "";
        }
        return res;
      }
      return res;
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "internale server errore  or server is downe",
      };
    }
  }
}
