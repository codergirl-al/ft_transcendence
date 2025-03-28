document.addEventListener('DOMContentLoaded', () => {
	// Select the edit profile form by checking the action attribute that starts with "/api/user/"
	const form = document.querySelector("form[action^='/api/user/']") as HTMLFormElement | null;
	const statusElement = document.querySelector("p.text-red-400") as HTMLElement | null;
  
	if (form) {
	  form.addEventListener('submit', async (event) => {
		event.preventDefault(); // Prevent the default form submission
  
		// Gather the form data
		const formData = new FormData(form);
  
		try {
		  const response = await fetch(form.action, {
			method: 'POST',
			body: formData,
		  });
  
		  if (!response.ok) {
			// If there's an error, read the error message and display it
			const errorData = await response.json();
			if (statusElement) {
			  statusElement.textContent = errorData.message || 'Error updating profile.';
			}
		  } else {
			// On success, redirect the user to the profile view or dashboard
			window.location.href = `/api/user/${formData.get('username')}`;
		  }
		} catch (error) {
		  console.error('Error submitting edit profile form:', error);
		  if (statusElement) {
			statusElement.textContent = 'An unexpected error occurred. Please try again.';
		  }
		}
	  });
	}
  });
