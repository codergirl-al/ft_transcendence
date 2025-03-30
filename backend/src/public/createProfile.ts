const createProfile = document.getElementById('createProfileForm');
if (createProfile)
{
	createProfile.addEventListener('submit', async function(event) {
		event.preventDefault();
		const usernameInput = document.getElementById('username') as HTMLInputElement | null;
		const username = usernameInput?.value.trim();
		if (!username) {
			const status = document.getElementById('createStatus');
			if (status)
				status.textContent = "Username is required";
			return;
		}
		try {
			const response = await fetch('/api/user', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username })
			});
			const data = await response.json();
			if (!response.ok) {
				const status = document.getElementById('createStatus');
				if (status)
					status.textContent = data.message || 'Error creating profile';
			} else {
				window.location.hash = '#account';
				// window.location.reload();
			}
		} catch (error) {
			console.error('Error creating profile:', error);
			const status = document.getElementById('createStatus');
			if (status)
				status.textContent = 'Network error';
		}
	});
}