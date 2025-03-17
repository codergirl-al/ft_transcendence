import { renderHome } from "./home";
export function renderChat(container: HTMLElement) {
	container.innerHTML = `
	  <div class='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center'>
		<div class='bg-light p-6 rounded-lg shadow-lg w-96'>
		  <h2 class='text-2xl font-bold mb-4'>LIVE CHAT</h2>
		  <button id='close-chat' class='absolute top-4 right-4 text-black'>X</button>
		  
		  <div class='space-y-4'>
			<textarea id='chat-input' class='w-full p-2 border rounded-md' placeholder='Type a message...'></textarea>
			<button id='send-message' class='w-full px-4 py-2 bg-primary text-white rounded-md'>Send</button>
		  </div>
		</div>
	  </div>
	`;
  
	document.getElementById("close-chat")?.addEventListener("click", () => {
	  window.history.pushState({ page: "home" }, "", "#home");
	  renderHome(document.getElementById("app")!);
	});
  
	document.getElementById("send-message")?.addEventListener("click", () => {
	  const message = (document.getElementById("chat-input") as HTMLTextAreaElement).value;
	  if (message.trim()) {
		alert(`Message sent: ${message}`);
		(document.getElementById("chat-input") as HTMLTextAreaElement).value = "";
	  }
	});
  }