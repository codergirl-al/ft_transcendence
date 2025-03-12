// main.ts - Core script to handle page rendering and navigation

import { renderHome } from "./pages/home";
import { renderSettings } from "./pages/settings";
import { renderChat } from "./pages/chat";
import { toggleTheme } from "./components/theme";
import { toggleLanguage } from "./components/language";
import './style.css';

console.log('Hello, TypeScript and Tailwind CSS!');


const app = document.getElementById("app");

function renderPage(page: string, pushState = true) {
  if (!app) return;
  app.innerHTML = "";

  switch (page) {
	case "home":
	  renderHome(app);
	  break;
	case "settings":
	  renderSettings(app);
	  break;
	case "chat":
	  renderChat(app);
	  break;
	default:
	  renderHome(app);
  }
  
  if (pushState) {
	window.history.pushState({ page }, "", `#${page}`);
  }
}

// Handle browser Back/Forward navigation
window.onpopstate = (event) => {
  const page = event.state?.page || "home";
  renderPage(page, false);
};

// Initial Page Load Based on URL Hash
const initialPage = window.location.hash.replace("#", "") || "home";
renderPage(initialPage, false);

// Setup Theme & Language Switchers
toggleTheme();
toggleLanguage();
