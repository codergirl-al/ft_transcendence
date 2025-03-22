// const menuButton = document.getElementById('menuButton');
// const flyoutMenu = document.getElementById('flyoutMenu');
// const closeFlyout = document.getElementById('closeFlyout');

// menuButton?.addEventListener('click', () => {
// // Toggle the 'hidden' class on the flyout menu
// flyoutMenu?.classList.toggle('hidden');
// });
// closeFlyout?.addEventListener('click', () => {
// flyoutMenu?.classList.add('hidden');
// });

// const usernameDisplay = document.getElementById('usernameDisplay');
// const userStatsModal = document.getElementById('userStatsModal');
// const closeModalBtn = document.getElementById('closeModalBtn');

// usernameDisplay?.addEventListener('click', function() {
// 	userStatsModal?.classList.remove('hidden');
// 	});

// 	closeModalBtn?.addEventListener('click', function() {
// 	userStatsModal?.classList.add('hidden');
// 	});


// 		// Buttons on the select game mode page
// 		const openSingleModal = document.getElementById('openSingleModal');
// 		const openMultiModal = document.getElementById('openMultiModal');
		
// 		const singlePlayerModal = document.getElementById('singlePlayerModal');
// 		const multiPlayerModal = document.getElementById('multiPlayerModal');
		
// 		const closeSingleModalBtn = document.getElementById('closeSingleModalBtn');
// 		const closeMultiModalBtn = document.getElementById('closeMultiModalBtn');
	
// 		// Open modals on button click
// 		if (openSingleModal) {
// 			openSingleModal.addEventListener('click', () => {
// 				singlePlayerModal?.classList.remove('hidden');
// 			});
// 		}
// 		if (openMultiModal) {
// 			openMultiModal.addEventListener('click', () => {
// 				multiPlayerModal?.classList.remove('hidden');
// 			});
// 		}
		
// 		// Close modals on close button click
// 		if (closeSingleModalBtn) {
// 			closeSingleModalBtn.addEventListener('click', () => {
// 				singlePlayerModal?.classList.add('hidden');
// 			});
// 		}
// 		if (closeMultiModalBtn) {
// 			closeMultiModalBtn.addEventListener('click', () => {
// 				multiPlayerModal?.classList.add('hidden');
// 			});
// 		}
	
// 		const newGameLink = document.getElementById('newGameLink');
// 		const newGameModal = document.getElementById('newGameModal');
// 		const closeNewGameModal = document.getElementById('closeNewGameModal');

// 		// Open the modal when the link is clicked
// 		newGameLink?.addEventListener('click', (e) => {
// 			e.preventDefault(); // Prevent the default navigation behavior
// 			newGameModal?.classList.remove('hidden');
// 		});

// 		// Close the modal when the close button is clicked
// 		closeNewGameModal?.addEventListener('click', () => {
// 			newGameModal?.classList.add('hidden');
// 		});

// 	const openModalBtn = document.getElementById('openNewGameModal');
	
// 		openModalBtn?.addEventListener('click', () => {
// 		newGameModal?.classList.remove('hidden');
// 		});
	
// 		closeModalBtn?.addEventListener('click', () => {
// 		newGameModal?.classList.add('hidden');
// 		});

// public/index.ts

// Toggle the flyout menu
const menuButton = document.getElementById('menuButton') as HTMLButtonElement | null;
const flyoutMenu = document.getElementById('flyoutMenu') as HTMLDivElement | null;
const closeFlyout = document.getElementById('closeFlyout') as HTMLButtonElement | null;

if (menuButton && flyoutMenu) {
  menuButton.addEventListener('click', () => {
    flyoutMenu.classList.toggle('hidden');
  });
}

if (closeFlyout && flyoutMenu) {
  closeFlyout.addEventListener('click', () => {
    flyoutMenu.classList.add('hidden');
  });
}

// Account popover logic (optional)
// Toggle the account popover when the "Login to Account" link is clicked
const accountPopover = document.getElementById('accountPopover') as HTMLDivElement | null;
const googleLoginLink = document.getElementById('googleLoginLink') as HTMLAnchorElement | null;

if (googleLoginLink && accountPopover) {
  googleLoginLink.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent default navigation if you want to toggle the popover
    accountPopover.classList.toggle('hidden');
  });
}

// Optionally, add event listeners for account popover buttons
const existingAccountBtn = document.getElementById('existingAccountBtn') as HTMLButtonElement | null;
const newAccountBtn = document.getElementById('newAccountBtn') as HTMLButtonElement | null;

if (existingAccountBtn) {
  existingAccountBtn.addEventListener('click', () => {
    // Redirect or handle login for an existing account
    location.href = '/login';
  });
}

if (newAccountBtn) {
  newAccountBtn.addEventListener('click', () => {
    // Redirect or handle new account creation
    location.href = '/profile/new';
  });
}
