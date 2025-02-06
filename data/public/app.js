const API_URL = "../api/posts.php";

async function fetchPosts() {
    const res = await fetch(API_URL);
    const posts = await res.json();
    document.getElementById("posts").innerHTML = posts.map(post => `
        <div>
            <h3>${post.title}</h3>
            <p>${post.content}</p>
            <button onclick="deletePost(${post.id})">Delete</button>
            <button onclick="editPost(${post.id}, '${post.title}', '${post.content}')">Edit</button>
        </div>
    `).join("");
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

function editPost(id, title, content) {
    document.getElementById("title").value = title;
    document.getElementById("content").value = content;
    
    document.querySelector("button[onclick='createPost()']").onclick = async function () {
        await fetch(API_URL, {
            method: "PUT",
            body: JSON.stringify({ id, title: document.getElementById("title").value, content: document.getElementById("content").value }),
            headers: { "Content-Type": "application/json" }
        });
        fetchPosts();
    };
}

fetchPosts();
