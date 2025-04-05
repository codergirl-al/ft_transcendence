const createProfile = document.getElementById('createProfileForm');
if (createProfile)
{
	createProfile.addEventListener('submit', async function(event) {
		event.preventDefault();
		const usernameInput = document.getElementById('username') as HTMLInputElement | null;
		const status = document.getElementById('createStatus');
		const username = usernameInput?.value.trim();
		if (!username) {
			if (status)
				status.textContent = "Username is required";
			return;
		}
		const invalid = ['all', 'delete', 'logout'];
		if (invalid.find(x => x === username)) {
			if (status)
				status.textContent = 'Error creating profile';
			return; // Added missing return statement here
		}
		try {
			const response = await fetch('/api/user', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username })
			});
			const data = await response.json();
			if (!response.ok) {
				if (status)
					status.textContent = data.message || 'Error creating profile';
			} else {
				// Store the username in localStorage
				localStorage.setItem('username', username);
				
				// Change to account page first
				window.location.hash = '#account';
				
				// Then reload the page
				setTimeout(() => {
					window.location.reload();
				}, 100);
			}
		} catch (error) {
			if (status)
				status.textContent = 'Network error';
		}
	});
}
