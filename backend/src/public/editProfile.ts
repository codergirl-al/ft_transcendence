let currentUsername = null as any;

async function loadEditProfileData() {
	try {
		const response = await fetch("/api/user", { method: 'GET' });
		if (response.ok) {
			const data = await response.json();
			if (data.data) {
				currentUsername = data.data.username;
				const editImage = document.getElementById("editAvatar") as HTMLImageElement | null;
				if (editImage)
					editImage.src = `/uploads/${data.data.id}.png`;
			}
		}
	} catch (error) {
  // Intentionally swallowing the error to avoid console noise.
  }
}
loadEditProfileData();

const editForm = document.getElementById('editProfileForm') as HTMLFormElement | null;
if (editForm) {
	editForm.addEventListener('submit', async function (event) {
		event.preventDefault();
		const formData = new FormData(this);
		const invalid = [currentUsername, 'all', 'delete', 'logout'];
		const username = formData.get('username');
		if (invalid.find(x => x === username)) {
			const status = document.getElementById('editStatus');
			if (status)
				status.textContent = 'No changes detected. Profile not updated.';
			return;
		}
		try {
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
				if (result.data && result.data.username) {
					currentUsername = result.data.username;
				}
				window.location.hash = '#account';
				window.location.reload();
			}
		} catch (error) {
			const status = document.getElementById('editStatus');
			if (status)
				status.textContent = 'Network error';
		}
	});
}


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
				} else {
					alert("Error deleting profile");
				}
			} catch (error) {
				// Intentionally swallowing the error to avoid console noise.
			}
		}
	});
}
