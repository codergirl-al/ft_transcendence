const login = document.getElementById("logoutLink");
if (login)
  login.addEventListener("click", async (event) => {
  event.preventDefault();
  try {
	const response = await fetch("/api/user/logout", { method: "GET" });
	if (response.ok) {
	  // After successful logout, redirect to the index view.
	  window.location.hash = "#index";
	//   window.location.reload();
	} else {
	  console.error("Logout failed");
	}
  } catch (error) {
	console.error("Error logging out:", error);
  }
});
