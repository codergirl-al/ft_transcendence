import { renderHome } from "./home";
export function renderSettings(container: HTMLElement) {
	container.innerHTML = `
	  <div class='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center'>
		<div class='bg-light p-6 rounded-lg shadow-lg w-96'>
		  <h2 class='text-2xl font-bold mb-4'>SETTINGS</h2>
		  <button id='close-settings' class='absolute top-4 right-4 text-black'>X</button>
		  
		  <div class='space-y-4'>
			<button id='toggle-online' class='w-full px-4 py-2 bg-primary text-white rounded-md'>Toggle Online/Offline</button>
			<button id='toggle-theme' class='w-full px-4 py-2 bg-primary text-white rounded-md'>Toggle Theme</button>
			<button id='toggle-language' class='w-full px-4 py-2 bg-primary text-white rounded-md'>Toggle Language</button>
		  </div>
		</div>
	  </div>
	`;
  
	document.getElementById("close-settings")?.addEventListener("click", () => {
	  window.history.pushState({ page: "home" }, "", "#home");
	  renderHome(document.getElementById("app")!);
	});
  
	document.getElementById("toggle-online")?.addEventListener("click", () => {
	  alert("Toggled Online/Offline Mode");
	});
  
	document.getElementById("toggle-theme")?.addEventListener("click", () => {
	  document.body.classList.toggle("bg-dark");
	  document.body.classList.toggle("bg-light");
	});
  
	document.getElementById("toggle-language")?.addEventListener("click", () => {
	  alert("Language Changed");
	});
  }
  