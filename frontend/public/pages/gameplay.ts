import { renderHome } from "./home";
export function renderGameplay(container: HTMLElement) {
	container.innerHTML = `
	  <div class='flex flex-col items-center justify-center min-h-screen text-center'>
		<h1 class='text-4xl font-bold'>PING GAME</h1>
		<div class='mt-6 space-y-4'>
		  <button id='single-player-btn' class='px-6 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-secondary'>Single Player</button>
		  <button id='multi-player-btn' class='px-6 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-secondary'>Multiplayer</button>
		  <button id='tournament-btn' class='px-6 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-secondary'>Tournament</button>
		</div>
		<button id='back-home' class='mt-6 px-4 py-2 bg-secondary text-white rounded-md'>Back</button>
	  </div>
	`;
  
	document.getElementById("back-home")?.addEventListener("click", () => {
	  window.history.pushState({ page: "home" }, "", "#home");
	  renderHome(document.getElementById("app")!);
	});
  }