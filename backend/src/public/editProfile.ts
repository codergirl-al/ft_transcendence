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
				const editUser = document.getElementById("editUsername") as HTMLInputElement | null;
				if (editUser)
					editUser.value = data.data.username;
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
if (editForm)
{
	editForm.addEventListener('submit', async function(event) {
		event.preventDefault();
		const formData = new FormData(this);
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
		}else {
			// On success, navigate to the account view.
			window.location.hash = '#account';
			window.location.reload();
		}
		} catch (error) {
			console.error('Error updating profile:', error);
			const status = document.getElementById('editStatus')
			if (status)
				status.textContent = 'Network error';
		}
	});
}

// Handle delete profile button click.
const deleteProfile = document.getElementById('deleteProfileBtn');
if (deleteProfile)
{
	deleteProfile.addEventListener('click', async function() {
			if (confirm("Are you sure you want to delete your profile? This action cannot be undone.")) {
		try {
			const response = await fetch('/api/user/delete', { method: 'GET' });
			if (response.ok) {
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
