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
				window.location.hash = '#account';
				// showView('account-view');
				window.location.reload();
			}
		} catch (error) {
			console.error('Error creating profile:', error);
			if (status)
				status.textContent = 'Network error';
		}
	});
}