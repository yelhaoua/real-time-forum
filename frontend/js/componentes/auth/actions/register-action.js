export default async function RegisterAction(e) {
  e.preventDefault();

  const nickNameErr=document.getElementById("nickname-Err");
  const firstNameErr=document.getElementById("first-name-Err");
  const lastNameErr=document.getElementById("last-name-Err");
  const birthDateErr=document.getElementById("user-birthdate-Err");
  const genderErr=document.getElementById("gender-Err");
  const emailErr=document.getElementById("email-Err");
  const passErr=document.getElementById("pass-Err");

  const clearError=(el)=> {
    if (el) el.innerHTML="";
  }

  ;
  clearError(nickNameErr);
  clearError(firstNameErr);
  clearError(lastNameErr);
  clearError(birthDateErr);
  clearError(genderErr);
  clearError(emailErr);
  clearError(passErr);

  const formData=new FormData(e.target);
  const data=Object.fromEntries(formData.entries());

  const birthDateValue=data["user-birthdate"];

  if (birthDateValue) {
    const birthDate=new Date(`$ {
        birthDateValue
      }

      T00:00:00`);

    if (Number.isNaN(birthDate.getTime())) {
      if (birthDateErr) birthDateErr.innerHTML="Birth date is invalid";

      return {
        success: false,
          error: "invalid_birthdate",
          message: "Please enter a valid birth date.",
      }

      ;
    }

    const today=new Date();
    let age=today.getFullYear() - birthDate.getFullYear();
    const monthDiff=today.getMonth() - birthDate.getMonth();
    const dayDiff=today.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff===0 && dayDiff < 0)) {
      age -=1;
    }

    if (age < 18) {
      if (birthDateErr) birthDateErr.innerHTML="You must be at least 18 years old";

      return {
        success: false,
          error: "underage",
          message: "You must be at least 18 years old to register.",
      }

      ;
    }
  }

  try {
    const response=await fetch("http://localhost:9090/register", {

        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }

        ,
        body: JSON.stringify(data),
        credentials: "include",
      }

    );

    const res=await response.json();

    if ( !response.ok) {
      if (res.message==="login") {
        window.location.hash="#/";

        return {
          success: false,
            error: "session_exists",
            message: "You are already logged in.",
        }

        ;
      }

      if (res.data) {
        if (nickNameErr) nickNameErr.innerHTML=res.data.nickname || "";
        if (firstNameErr) firstNameErr.innerHTML=res.data.first_name || "";
        if (lastNameErr) lastNameErr.innerHTML=res.data.last_name || "";
        if (birthDateErr) birthDateErr.innerHTML=res.data.birthdate || "";
        if (genderErr) genderErr.innerHTML=res.data.gender || "";
        if (emailErr) emailErr.innerHTML=res.data.email || "";
        if (passErr) passErr.innerHTML=res.data.password || "";
      }

      return {
        success: false,
          error: res.error || "registration_error",
          message: res.message || "Validation failed.",
      }

      ;
    }

    return res;
  }

  catch (error) {
    console.error("Register network error:", error);
    Baner("Error", "Failed to register. Please try again later.", "error");
    

    ;
  }
}