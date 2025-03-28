const menuButton = document.getElementById('menuButton') as HTMLButtonElement | null;
const flyoutMenu = document.getElementById('flyoutMenu') as HTMLDivElement | null;
const closeFlyout = document.getElementById('closeFlyout') as HTMLButtonElement | null;

if (menuButton && flyoutMenu) {
  menuButton.addEventListener('click', () => {
    flyoutMenu.classList.toggle('hidden');
  });
}

if (closeFlyout && flyoutMenu) {
  closeFlyout.addEventListener('click', () => {
    flyoutMenu.classList.add('hidden');
  });
}