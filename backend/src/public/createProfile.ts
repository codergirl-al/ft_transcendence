document.addEventListener('DOMContentLoaded', () => {
	// Select the create profile form by its action attribute
	const form = document.querySelector("form[action='/api/user']") as HTMLFormElement | null;
	// Select the paragraph element used for showing status messages
	const statusElement = document.querySelector("p.text-red-400") as HTMLElement | null;
  
	if (form) {
	  form.addEventListener('submit', async (event) => {
		event.preventDefault(); // Prevent the default full page reload
		
		// Gather the form data
		const formData = new FormData(form);
		
		// You can convert FormData to URLSearchParams for easier handling
		const params = new URLSearchParams();
		formData.forEach((value, key) => {
		  params.append(key, value.toString());
		});
  
		try {
		  const response = await fetch('/api/user', {
			method: 'POST',
			headers: {
			  // Ensure that your backend can parse URL-encoded form data.
			  'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: params.toString()
		  });
  
		  if (!response.ok) {
			// If the response is not OK, read the error and display it
			const errorData = await response.json();
			if (statusElement) {
			  statusElement.textContent = errorData.message || 'An error occurred while creating your profile.';
			}
		  } else {
			// On success, redirect the user to the dashboard
			window.location.href = '/api/user/dashboard';
		  }
		} catch (error) {
		  console.error('Error submitting form:', error);
		  if (statusElement) {
			statusElement.textContent = 'An unexpected error occurred. Please try again.';
		  }
		}
	  });
	}
  });
