export const homePage = () => `
    <div class="flex flex-col items-center justify-center h-screen">
        <h1 class="text-5xl font-bold">PING <span class="text-orange-500">PONG</span></h1>
        <div class="mt-8 space-y-4">
            <button onclick="navigateTo('/game')" class="bg-purple-500 px-6 py-3 rounded-md shadow-md text-xl">
                Single Player
            </button>
            <button onclick="navigateTo('/settings')" class="bg-purple-500 px-6 py-3 rounded-md shadow-md text-xl">
                Settings
            </button>
        </div>
    </div>
`;

export const gamePage = () => `
    <div class="flex flex-col items-center justify-center h-screen">
        <h1 class="text-4xl font-bold">Game Page</h1>
        <canvas id="pongCanvas" class="border border-white mt-4"></canvas>
    </div>
`;

export const settingsPage = () => `
    <div id="settingsPanel" class="fixed top-0 right-0 w-64 h-full bg-purple-300 p-6 shadow-lg transform translate-x-full transition-transform duration-300">
        <h2 class="text-black text-2xl font-bold mb-4">SETTINGS</h2>
        <button id="closeSettings" class="absolute top-4 right-4 text-black text-2xl">&times;</button>
        
        <div class="mt-4 space-y-3">
            <button onclick="navigateTo('/')" class="bg-purple-600 w-full py-3 rounded-md text-white">
                Home
            </button>
            <button onclick="navigateTo('/game')" class="bg-purple-600 w-full py-3 rounded-md text-white">
                Game
            </button>
            <button id="signInBtn" class="bg-green-500 w-full py-3 rounded-md text-white">
                Sign In
            </button>
            <button id="signOutBtn" class="bg-red-500 w-full py-3 rounded-md text-white hidden">
                Sign Out
            </button>
        </div>
    </div>
`;
