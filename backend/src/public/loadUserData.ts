document.addEventListener("DOMContentLoaded", async () => {
	loadUserData();
		const hamburgerBtn = document.getElementById("hamburgerBtn");
		const mobileMenu = document.getElementById("mobileMenu");
		if (!hamburgerBtn || !mobileMenu) {
			return;
		}
		hamburgerBtn.addEventListener("click", () => {
			mobileMenu.classList.toggle("hidden");
		});
});

async function loadUserData() {
	try {
		const response = await fetch("/api/user", { method: 'GET' });
		// If user is not found, show create profile view
		if (!response.ok) {
			if (response.status === 404) {
				showView('createProfile-view');
				return;
			} else {
				// throw new Error('Network response was not ok');
				showView('index-view');
			}
		}
		const data = await response.json();
		if (!data.data) {
			showView('index-view');
			return;
		}
		localStorage.setItem('username', data.data.username);
		// Populate header with user data
		const username = document.getElementById("usernameDisplay") as HTMLElement | null;
		if (username) {
			username.textContent = data.data.username;
			localStorage.setItem("username", data.data.username);
		}
		const email = document.getElementById("userEmail") as HTMLElement | null;
		if (email)
		email.textContent = data.data.email;
		const image = document.getElementById("userAvatar") as HTMLImageElement | null;
		if (image)
		image.src = `/uploads/${data.data.id}.png`;
	} catch (error) {
		// showView('createProfile-view');
	}
}

// loadUserData();