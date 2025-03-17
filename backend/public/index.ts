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

document.getElementById('googleLoginLink')?.addEventListener('click', () => {
	// alert('Google Login clicked!');
	window.location.href = '/google-login';
	
});