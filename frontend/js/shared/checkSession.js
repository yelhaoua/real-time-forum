export default async function CheckSession() {
  const req = await fetch("http://localhost:9090/checksession", {
    method: "GET",
    credentials: "include",
  });

  const res = req.json();

  if (req.ok) {
    window.location.href = "/";
  }
}