const menuButton = document.getElementById('menuButton');
const flyoutMenu = document.getElementById('flyoutMenu');
const closeFlyout = document.getElementById('closeFlyout');

menuButton?.addEventListener('click', () => {
// Toggle the 'hidden' class on the flyout menu
flyoutMenu?.classList.toggle('hidden');
});
closeFlyout?.addEventListener('click', () => {
flyoutMenu?.classList.add('hidden');
});

const usernameDisplay = document.getElementById('usernameDisplay');
const userStatsModal = document.getElementById('userStatsModal');
const closeModalBtn = document.getElementById('closeModalBtn');

usernameDisplay?.addEventListener('click', function() {
	userStatsModal?.classList.remove('hidden');
  });

  closeModalBtn?.addEventListener('click', function() {
	userStatsModal?.classList.add('hidden');
  });