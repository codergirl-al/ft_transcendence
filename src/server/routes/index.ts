// import { homePage, settingsPage, gamePage } from "../public/page";
export const indexPage = () => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Transcendence</title>
    <link rel="stylesheet" href="/public/tailwind.css">
    <script type="module" src="/public/main.ts"></script>
</head>
<body class="bg-purple-900 text-white flex justify-center items-center h-screen">
    <div>
        <h1 class="text-5xl font-bold">Welcome to Ping Pong</h1>
        <button onclick="navigateTo('/gamePage')" class="mt-4 bg-blue-500 px-6 py-3 rounded-md shadow-md">
            Play Game
        </button>
        <button onclick="navigateTo('/settingsPage')" class="mt-4 bg-gray-500 px-6 py-3 rounded-md shadow-md">
            Settings
        </button>
    </div>
</body>
</html>
`;
