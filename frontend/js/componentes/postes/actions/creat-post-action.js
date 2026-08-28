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
    return {
      success: false,
      message: "Unable to create post right now.",
    };
  } finally {
    form.dataset.submitting = "false";
  }
}
