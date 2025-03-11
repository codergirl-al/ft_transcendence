function navigate(page) {
	history.pushState({ page }, '', '#' + page);
	showPage(page);
}

function showPage(page) {
	document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
	document.getElementById(page).classList.add('active');
}

window.onpopstate = function(event) {
	if (event.state) {
		showPage(event.state.page);
	}
};

window.onload = function() {
	const page = location.hash.replace('#', '') || 'login';
	showPage(page);
};

function flipCoin() {
	const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
	document.getElementById('gameResult').innerText = 'Result: ' + result;
}