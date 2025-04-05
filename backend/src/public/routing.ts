document.addEventListener("DOMContentLoaded", async () => {
	window.addEventListener('hashchange', route);
	route();
});

function showView(viewId: string) {
	document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
	const view = document.getElementById(viewId);
	if (view) view.classList.add('active');
}

function route() {
	let hash = window.location.hash.slice(1);
	const user = localStorage.getItem('username');
	if (!user || !hash)
		hash = 'index';
	switch (hash) {
		case 'account':
			showView('account-view');
			break;
		case 'createProfile':
			showView('createProfile-view');
			break;
		case 'editProfile':
			showView('editProfile-view');
			break;
		case 'search':
			showView('search-view');
			break;
		case 'singleplayer':
			showView('singleplayer-view');
			break;
		case 'multiplayer':
			showView('multiplayer-view');
			break;
		case 'tournament-start':
			showView('tournament-start-view');
			break;
		case 'tournament':
			showView('tournament-registration-view');
			break;
		case 'index':
			showView('index-view');
			break;
		default:
			showView('account-view');
			break;
	}
}

