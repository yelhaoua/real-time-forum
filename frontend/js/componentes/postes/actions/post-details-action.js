// export default async function PostesDetailesAction(postId) {
//   try {
//     const req = await fetch(`http://localhost:9090/post/${postId}`, {
//       method: "GET",
//       headers: { "Content-Type": "application/json" },
//       credentials: "include",
//     });
//     const res = await req.json();


//     return res;
//   } catch (error) {
//     console.error("Failed to fetch post details:", error);
//     Baner(
//       "Error",
//       "Failed to fetch post details. Please try again later.",
//       "error",
//     );
//   }
// }

// export async function GetCommetesAction(id) {
//   try {
//     const req = await fetch(`http://localhost:9090/comment/${id}`, {
//       method: "GET",
//       headers: { "Content-Type": "application/json" },
//       credentials: "include",
//     });

//     const res = await req.json();

//     return res;
//   } catch (error) {
//     console.error("Failed to fetch comments:", error);
//     Baner(
//       "Error",
//       "Failed to fetch comments. Please try again later.",
//       "error",
//     );
//   }
// }
