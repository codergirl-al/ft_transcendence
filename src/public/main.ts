import { homePage, settingsPage, gamePage } from "./page";
import "./tailwind.css";

const routes: { [key: string]: () => string } = {
  "/": homePage,
  "/game": gamePage,
  "/settings": settingsPage,
};

export const navigateTo = (path: string) => {
  history.pushState({}, "", path);
  loadPage(path);
};

export const loadPage = (path: string) => {
  const app = document.getElementById("app")!;
  app.innerHTML = routes[path]
    ? routes[path]()
    : "<h1>404 - Page Not Found</h1>";

  // Attach event listeners after rendering the new page
  if (path === "/settings") {
    setupSettingsPopover();
  }
};

// Handle browser back/forward navigation
window.onpopstate = () => loadPage(window.location.pathname);

document.addEventListener("DOMContentLoaded", () => {
  loadPage(window.location.pathname);
  setupSettingsButton();
});

// Show/hide settings popover
const setupSettingsPopover = () => {
  const settingsPanel = document.getElementById("settingsPanel");
  const closeSettings = document.getElementById("closeSettings");

  if (!settingsPanel || !closeSettings) return; // Ensure elements exist

  settingsPanel.classList.remove("translate-x-full");

  closeSettings.addEventListener("click", () => {
    settingsPanel.classList.add("translate-x-full");
  });

  // Handle Sign In/Sign Out logic
  const signInBtn = document.getElementById("signInBtn")!;
  const signOutBtn = document.getElementById("signOutBtn")!;

  signInBtn.addEventListener("click", () => {
    localStorage.setItem("user", "loggedIn");
    signInBtn.classList.add("hidden");
    signOutBtn.classList.remove("hidden");
  });

  signOutBtn.addEventListener("click", () => {
    localStorage.removeItem("user");
    signInBtn.classList.remove("hidden");
    signOutBtn.classList.add("hidden");
  });

  // Check user authentication status
  if (localStorage.getItem("user")) {
    signInBtn.classList.add("hidden");
    signOutBtn.classList.remove("hidden");
  } else {
    signInBtn.classList.remove("hidden");
    signOutBtn.classList.add("hidden");
  }
};

// Add settings button to home page
const setupSettingsButton = () => {
  const settingsBtn = document.createElement("button");
  settingsBtn.innerHTML = "⚙️";
  settingsBtn.className =
    "fixed top-4 right-4 text-3xl bg-purple-600 text-white p-2 rounded-full shadow-lg";
  settingsBtn.addEventListener("click", () => navigateTo("/settings"));

  document.body.appendChild(settingsBtn);
};
