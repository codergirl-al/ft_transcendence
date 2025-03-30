// account.ts
document.addEventListener("DOMContentLoaded", () => {
	// Get elements from the dashboard
	const usernameDisplay = document.getElementById("usernameDisplay");
	const userStatsModal = document.getElementById("userStatsModal");
	const closeModalBtn = document.getElementById("closeModalBtn");
	const friendbtn = document.getElementById("friendrequestbtn");
	const frienduser = document.getElementById("friend") as HTMLInputElement;
  
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
	
	// When a friend request is sent check and send
	if (friendbtn && frienduser) {
		friendbtn.addEventListener("click", async () => {
			const username = frienduser.value.trim();
			try {
				const response = await fetch(`/api/friend`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ username })});
				if (!response.ok)
					console.error("friend Error 1");
				const data = await response.json();
				console.log(data);
			} catch (error) {
				console.error(error);
			}
	  });
	}
  });