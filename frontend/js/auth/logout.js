export default async function logout() {
  try {
    const res = await fetch("http://localhost:9090/logout", {
      method: "POST",
      credentials: "include",
    });

    if (res.ok) {
      window.location.href = "#/login";
    }
  } catch (err) {
    console.error(err);
  }
}