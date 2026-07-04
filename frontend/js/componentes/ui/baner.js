export default function Baner(title, description) {
  let Baner = document.createElement("div");
  Baner.id = "succes-Message";
  Baner.innerHTML = `
      <div >
        <h3>${title}</h3>
        <p>${description}</p>
      </div>
      `;

  let succesMessage = document.getElementById("succes-Message");

  if (succesMessage) {
    succesMessage.remove();
  }

  document.body.appendChild(Baner);
}
