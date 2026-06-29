export default function NavBar() {
  document.getElementById("nav-bar").innerHTML = `
    <nav>
      <a href="#/" class="nav-link">home</a>
      <a href="#/register" class="nav-link">register</a>
      <a href="#/login" class="nav-link">login</a>
    </nav>
    `;
}
