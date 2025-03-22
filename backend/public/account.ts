// account.ts
document.addEventListener("DOMContentLoaded", () => {
	// Get elements from the dashboard
	const usernameDisplay = document.getElementById("usernameDisplay");
	const userStatsModal = document.getElementById("userStatsModal");
	const closeModalBtn = document.getElementById("closeModalBtn");
  
	// When the username is clicked, open the stats modal
	if (usernameDisplay && userStatsModal) {
	  usernameDisplay.addEventListener("click", () => {
		userStatsModal.classList.remove("hidden");
	  });
	}
  
	// When the close button is clicked, hide the stats modal
	if (closeModalBtn && userStatsModal) {
	  closeModalBtn.addEventListener("click", () => {
		userStatsModal.classList.add("hidden");
	  });
	}
  });
  