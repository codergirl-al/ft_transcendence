const login =
 document.getElementById("logoutLink") ||
 document.getElementById("logoutLinkMobile");
if (login)
  login.addEventListener("click", async (event) => {
  event.preventDefault();
  try {
	const response = await fetch("/api/user/logout", { method: "GET" });
	if (response.ok) {
	  // After successful logout, redirect to the index view.
	  localStorage.removeItem('username');
	  window.location.hash = "#index";
	  window.location.reload();
	}
  } catch (error) {
	// Intentionally swallowing the error to avoid console noise.
  }
});
