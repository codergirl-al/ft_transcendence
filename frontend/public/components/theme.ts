export function toggleTheme() {
	const isDarkMode = document.body.classList.toggle("bg-dark");
	document.body.classList.toggle("bg-light", !isDarkMode);
	localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }
  
  export function applySavedTheme() {
	const savedTheme = localStorage.getItem("theme");
	if (savedTheme === "dark") {
	  document.body.classList.add("bg-dark");
	  document.body.classList.remove("bg-light");
	} else {
	  document.body.classList.add("bg-light");
	  document.body.classList.remove("bg-dark");
	}
  }
  
  // Apply saved theme on load
  applySavedTheme();