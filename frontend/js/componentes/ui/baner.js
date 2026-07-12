export default function Baner(title, description) {
  let Baner = document.createElement("div");
  Baner.id = "succes-Message";
  if (title || description) {
    Baner.innerHTML = `
        <div >
          <h3>${title ? title : ""}</h3>
          <p>${description ? description : ""}</p>
        </div>
        `;
  }

  let succesMessage = document.getElementById("succes-Message");

  if (succesMessage) {
    succesMessage.remove();
  }

  document.body.appendChild(Baner);
  setTimeout(() => {
    let succesMessage = document.getElementById("succes-Message");
    succesMessage.remove();
  }, 4000);
}
