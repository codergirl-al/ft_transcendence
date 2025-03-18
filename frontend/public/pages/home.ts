// home.ts - Home Screen Implementation
import { renderAuth } from "./auth";
import { renderGameplay } from "./gameplay";
import { renderChat } from "./chat";
import { renderSettings } from "./settings";
import { toggleTheme } from "../components/theme";
import { toggleLanguage } from "../components/language";

// home.ts - Home Screen Implementation

export function renderHome(container: HTMLElement) {
	container.innerHTML = `
	  <div class='flex flex-col items-center justify-center min-h-screen text-center'>
		<h1 class='text-4xl font-bold'>WELCOME TO <span class='text-primary'>PING</span></h1>
		<p class='mt-2 text-lg'>FOR MORE INFORMATION CLICK ON THE TOP RIGHT PLUS ICON</p>
		
		<button id='settings-btn' class='mt-6 px-6 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-secondary'>
		  Open Settings
		</button>
		
		<button id='gameplay-btn' class='mt-4 px-6 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-secondary'>
		  Start Game
		</button>
		
		<button id='auth-btn' class='mt-4 px-6 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-secondary'>
		  Sign In / Sign Out
		</button>
		
		<button id='chat-btn' class='mt-4 px-6 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-secondary'>
		  Live Chat
		</button>
		
		<button id='theme-btn' class='mt-4 px-6 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-secondary'>
		  Toggle Theme
		</button>
		
		<button id='language-btn' class='mt-4 px-6 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-secondary'>
		  Change Language
		</button>
	  </div>
	`;
	
	document.getElementById("settings-btn")?.addEventListener("click", () => {
	  window.history.pushState({ page: "settings" }, "", "#settings");
	  renderSettings(document.getElementById("app")!);
	});
  
	document.getElementById("gameplay-btn")?.addEventListener("click", () => {
	  window.history.pushState({ page: "gameplay" }, "", "#gameplay");
	  renderGameplay(document.getElementById("app")!);
	});
	
	document.getElementById("auth-btn")?.addEventListener("click", () => {
	  window.history.pushState({ page: "auth" }, "", "#auth");
	  renderAuth(document.getElementById("app")!);
	});
  
	document.getElementById("chat-btn")?.addEventListener("click", () => {
	  window.history.pushState({ page: "chat" }, "", "#chat");
	  renderChat(document.getElementById("app")!);
	});
  
	document.getElementById("theme-btn")?.addEventListener("click", () => {
	  toggleTheme();
	});
	
	document.getElementById("language-btn")?.addEventListener("click", () => {
	  toggleLanguage();
	});
  }