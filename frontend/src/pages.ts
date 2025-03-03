export const menuPage = () => `
  <div class='menu'>
    <h1>Pong Game</h1>
    <button onclick="navigateTo('/game')">Play Game</button>
    <button onclick="navigateTo('/login')">Login</button>
  </div>
`;

export const loginPage = () => `
  <div class='login'>
    <h2>Login</h2>
    <form id='loginForm'>
      <input type='text' placeholder='Username' required>
      <input type='password' placeholder='Password' required>
      <button type='submit'>Login</button>
    </form>
  </div>
`;

export const gamePage = () => `
  <canvas id='pongCanvas'></canvas>
  <button onclick="navigateTo('/')">Exit</button>
`;
