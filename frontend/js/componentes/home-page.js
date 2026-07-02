import NavBar from "./nave-bare.js";
import CardPost from "./ui/card-post.js";

export default function HomePage() {
  window.onload = function () {
    const cardContainer = document.querySelector(".card-container");
    cardContainer.innerHTML = CardPost();
  };

  NavBar();
  return `<div class="card-container"></div>`;
}
