export default async function CheckSession() {
  try {
    const req = await fetch("http://localhost:9090/checksession", {
      method: "GET",
      credentials: "include",
    });
    return req.ok;
  } catch {
    return false;
  }
}