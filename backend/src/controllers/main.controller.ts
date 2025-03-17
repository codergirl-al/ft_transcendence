
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

// Example: hooking up event listeners to each menu item
// document.getElementById('userManagementLink')?.addEventListener('click', () => {
// 	alert('User Management clicked!');
// });
// document.getElementById('liveChatLink')?.addEventListener('click', () => {
// 	alert('Live Chat clicked!');
// });
// document.getElementById('googleLoginLink')?.addEventListener('click', () => {
// 	alert('Google Login clicked!');
// });
// document.getElementById('aiOpponentLink')?.addEventListener('click', () => {
// 	alert('AI Opponent clicked!');
// });
// document.getElementById('blockchainLink')?.addEventListener('click', () => {
// 	alert('Blockchain clicked!');
// });

// // Get references to the link and the popover
// const googleLoginLink = document.getElementById('googleLoginLink');
// const accountPopover = document.getElementById('accountPopover');

// // Toggle popover display when the login link is clicked
// googleLoginLink.addEventListener('click', function(event) {
// event.preventDefault();
// accountPopover.classList.toggle('hidden');
// });

// // Optional: add event listeners for the popover buttons
// document.getElementById('existingAccountBtn').addEventListener('click', function() {
// // Your logic for logging into an existing account goes here.
// console.log('User chose to log into an existing account');
// // For example, you might redirect the user or open another modal.
// });

// document.getElementById('newAccountBtn').addEventListener('click', function() {
// // Your logic for creating a new account goes here.
// console.log('User chose to create a new account');
// // For example, you might redirect to a sign-up page or open a sign-up form.
// });