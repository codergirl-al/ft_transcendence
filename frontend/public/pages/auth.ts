import { renderHome } from "./home";
let isAuthenticated = false;

export function renderAuth(container: HTMLElement) {
  container.innerHTML = `
    <div class='flex flex-col items-center justify-center min-h-screen text-center'>
      <h1 class='text-4xl font-bold'>${isAuthenticated ? "SIGN OUT" : "SIGN IN"}</h1>
      <button id='auth-toggle-btn' class='mt-6 px-6 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-secondary'>
        ${isAuthenticated ? "Sign Out" : "Sign In"}
      </button>
      <button id='back-home' class='mt-4 px-6 py-2 bg-secondary text-white rounded-md'>Back</button>
    </div>
  `;

  document.getElementById("auth-toggle-btn")?.addEventListener("click", () => {
    isAuthenticated = !isAuthenticated;
    alert(isAuthenticated ? "Signed In Successfully" : "Signed Out Successfully");
    renderAuth(container);
  });

  document.getElementById("back-home")?.addEventListener("click", () => {
    window.history.pushState({ page: "home" }, "", "#home");
    renderHome(document.getElementById("app")!);
  });
}
