const API_URL = "../api/posts.php";

async function fetchPosts() {
	const res = await fetch(API_URL);
	const posts = await res.json();
	document.getElementById("posts").innerHTML = posts.map(post => `
		<div>
			<h3>${post.title}</h3>
			<p>${post.content}</p>
			<button onclick="deletePost(${post.id})">Delete</button>
			<button onclick="showEditForm(${post.id}, '${post.title}', '${post.content}')">Edit</button>
		</div>
	`).join("");
}

function showEditForm(id, title, content) {
	document.getElementById("posts").innerHTML = `
		<div>
			<h3>Edit Post</h3>
			<input type="text" id="editTitle" value="${title}">
			<textarea id="editContent">${content}</textarea>
			<button onclick="editPost(${id})">Save Changes</button>
			<button onclick="fetchPosts()">Cancel</button>
		</div>
	`;
}

async function createPost() {
	const title = document.getElementById("title").value;
	const content = document.getElementById("content").value;

	await fetch(API_URL, {
		method: "POST",
		body: JSON.stringify({ title, content }),
		headers: { "Content-Type": "application/json" }
	});

	fetchPosts();
}

async function deletePost(id) {
	await fetch(API_URL, {
		method: "DELETE",
		body: JSON.stringify({ id }),
		headers: { "Content-Type": "application/json" }
	});

	fetchPosts();
}

async function editPost(id) {
	const title = document.getElementById("editTitle").value;
	const content = document.getElementById("editContent").value;

	await fetch(API_URL, {
		method: "PUT",
		body: JSON.stringify({ id, title, content }),
		headers: { "Content-Type": "application/json" }
	});

	fetchPosts(); // Refresh post list after updating
}

fetchPosts();
