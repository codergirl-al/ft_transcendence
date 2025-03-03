import { navigateTo, loadPage } from "./router";
import "./styles/tailwind.css";

document.addEventListener("DOMContentLoaded", () => {
  loadPage(window.location.pathname);
  window.onpopstate = () => loadPage(window.location.pathname);
});

