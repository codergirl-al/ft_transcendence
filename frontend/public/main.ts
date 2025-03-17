// // main.ts - Core script to handle page rendering and navigation

// import { renderHome } from "./pages/home";
// import { renderSettings } from "./pages/settings";
// import { renderChat } from "./pages/chat";
// import { toggleTheme } from "./components/theme";
// import { toggleLanguage } from "./components/language";
// import './style.css';

// console.log('Hello, TypeScript and Tailwind CSS!');


// const app = document.getElementById("app");

// function renderPage(page: string, pushState = true) {
//   if (!app) return;
//   app.innerHTML = "";

//   switch (page) {
// 	case "home":
// 	  renderHome(app);
// 	  break;
// 	case "settings":
// 	  renderSettings(app);
// 	  break;
// 	case "chat":
// 	  renderChat(app);
// 	  break;
// 	default:
// 	  renderHome(app);
//   }
  
//   if (pushState) {
// 	window.history.pushState({ page }, "", `#${page}`);
//   }
// }

// // Handle browser Back/Forward navigation
// window.onpopstate = (event) => {
//   const page = event.state?.page || "home";
//   renderPage(page, false);
// };

// // Initial Page Load Based on URL Hash
// const initialPage = window.location.hash.replace("#", "") || "home";
// renderPage(initialPage, false);

// // Setup Theme & Language Switchers
// toggleTheme();
// toggleLanguage();

const menuButton = document.getElementById('menuButton');
const flyoutMenu = document.getElementById('flyoutMenu');
const closeFlyout = document.getElementById('closeFlyout');

menuButton?.addEventListener('click', () => {
  // Toggle the 'hidden' class on the flyout menu
  flyoutMenu?.classList.toggle('hidden');
});
closeFlyout?.addEventListener('click', () => {
  flyoutMenu?.classList.add('hidden');
});

// Example: hooking up event listeners to each menu item
document.getElementById('userManagementLink')?.addEventListener('click', () => {
  alert('User Management clicked!');
});
document.getElementById('liveChatLink')?.addEventListener('click', () => {
  alert('Live Chat clicked!');
});
document.getElementById('googleLoginLink')?.addEventListener('click', () => {
  alert('Google Login clicked!');
});
document.getElementById('aiOpponentLink')?.addEventListener('click', () => {
  alert('AI Opponent clicked!');
});
document.getElementById('blockchainLink')?.addEventListener('click', () => {
  alert('Blockchain clicked!');
});