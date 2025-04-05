document.addEventListener('DOMContentLoaded', () => {
	// Get the elements by their IDs and cast them to appropriate types
	const openModalBtn = document.getElementById('openNewGameModal') as HTMLButtonElement | null;
	const newGameModal = document.getElementById('newGameModal') as HTMLElement | null;
	const closeModalBtn = document.getElementById('closeNewGameModal') as HTMLButtonElement | null;
	
	if (openModalBtn && newGameModal && closeModalBtn) {
	  // When the "New Game" button is clicked, remove the 'hidden' class to show the modal
	  openModalBtn.addEventListener('click', () => {
		newGameModal.classList.remove('hidden');
	  });
	
	  // When the close button is clicked, add the 'hidden' class to hide the modal
	  closeModalBtn.addEventListener('click', () => {
		newGameModal.classList.add('hidden');
	  });
	}
});