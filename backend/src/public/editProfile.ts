// Global variable to store the current username for updating the profile.
let currentUsername = null as any;

// Load current user data into the edit form.
async function loadEditProfileData() {
	try {
		const response = await fetch("/api/user", { method: 'GET' });
		if (response.ok) {
			const data = await response.json();
			if (data.data) {
				currentUsername = data.data.username; // Save the current username for the update endpoint.
				const editImage = document.getElementById("editAvatar") as HTMLImageElement | null;
				if (editImage)
					editImage.src = `/uploads/${data.data.id}.png`;
			}
		}
	} catch (error) {
		console.error('Error fetching user data for edit:', error);
	}
}
loadEditProfileData();

// Handle the edit profile form submission.

const editForm = document.getElementById('editProfileForm') as HTMLFormElement | null;
if (editForm) {
	editForm.addEventListener('submit', async function (event) {
		event.preventDefault();
		const formData = new FormData(this);
		console.log("Updated username:", formData.get('username'));
		const invalid = [currentUsername, 'all', 'delete', 'logout'];
		const username = formData.get('username');
		// Check if the username is unchanged or wrong.
		if (invalid.find(x => x === username)) {
			const status = document.getElementById('editStatus');
			if (status)
				status.textContent = 'No changes detected. Profile not updated.';
			return; // Exit early without sending a request.
		}
		try {
			// Send the form data to the update endpoint.
			const response = await fetch(`/api/user/${currentUsername}`, {
				method: 'POST',
				body: formData
			});
			const result = await response.json();
			if (!response.ok) {
				const status = document.getElementById('editStatus');
				if (status)
					status.textContent = result.message || 'Error updating profile';
			} else {
				// If the server returns updated user data, update currentUsername.
				if (result.data && result.data.username) {
					currentUsername = result.data.username;
				}
				// On success, navigate to the account view.
				window.location.hash = '#account';
				window.location.reload();
			}
		} catch (error) {
			console.error('Error updating profile:', error);
			const status = document.getElementById('editStatus');
			if (status)
				status.textContent = 'Network error';
		}
	});
}


// Handle delete profile button click.
const deleteProfile = document.getElementById('deleteProfileBtn');
if (deleteProfile) {
	deleteProfile.addEventListener('click', async function () {
		if (confirm("Are you sure you want to delete your profile? This action cannot be undone.")) {
			try {
				const response = await fetch('/api/user/delete', { method: 'GET' });
				if (response.ok) {
					localStorage.removeItem('username');
					window.location.hash = '#index';
					showView("index-view");
					// window.location.reload();
				} else {
					alert("Error deleting profile");
				}
			} catch (error) {
				console.error('Error deleting profile:', error);
			}
		}
	});
}
