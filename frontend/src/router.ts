import { menuPage, loginPage, gamePage } from "./pages";
const routes: { [key: string]: () => string } = {
  "/": menuPage,
  "/login": loginPage,
  "/game": gamePage,
};

export const navigateTo = (path: string) => {
  history.pushState({}, "", path);
  loadPage(path);
};

export const loadPage = (path: string) => {
  const app = document.getElementById("app");
  if (!app) return console.error("Error: #app not found");

  const page = routes[path];
  if (page) {
    app.innerHTML = page();
    console.log(`Loaded: ${path}`);
  } else {
    app.innerHTML = "<h1>404 - Page Not Found</h1>";
  }
};

document.addEventListener("DOMContentLoaded", () => {
  loadPage(window.location.pathname);
  window.onpopstate = () => loadPage(window.location.pathname);
});
