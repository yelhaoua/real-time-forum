import Baner from "../../ui/baner.js";

export default async function CreatePostAction(e) {
 
  if (e.target.id === "creat-post-form") {
    e.preventDefault();
    let formData = new FormData(e.target);

    try {
      const req = await fetch("http://localhost:9090/craet-post", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const res = await req.json();

      
      return res;
    } catch (error) {
      
    }
  }
}
