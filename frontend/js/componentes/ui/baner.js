export default function Baner(title, description) {
  let succesMessage = document.createElement("div");
  succesMessage.id = "succes-Message";
  succesMessage.innerHTML = `
      <div >
        <h3>${title}</h3>
        <p>${description}</p>
      </div>
      `;
  return succesMessage;
}
