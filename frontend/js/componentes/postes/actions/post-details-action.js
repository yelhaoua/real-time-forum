export default async function PostesDetailesAction(postId) {
  try {
    const req = await fetch(`http://localhost:9090/post/${postId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const res = await req.json();

    return res;
  } catch (error) {}
}

export async function GetCommetesAction(id) {
  try {
    const req = await fetch(`http://localhost:9090/comment/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const res = await req.json();

    return res;
  } catch (error) {}
}
