export default async function CreatePostAction(e) {
  const form = e?.target;

  if (form.id !== "creat-post-form") {
    return;
  }

  if (form.dataset.submitting === "true") {
    return;
  }

  form.dataset.submitting = "true";

  const formData = new FormData(form);

  try {
    const req = await fetch("http://localhost:9090/craet-post", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    return await req.json();
  } catch (error) {
    console.error("Failed to create post:", error);

    Baner("Error", "Failed to create post. Please try again later.", "error");
    
  } finally {
    form.dataset.submitting = "false";
  }
}
