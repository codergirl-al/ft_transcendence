export interface PlayerResponse {
 data: string[];
}

let allPlayersList: PlayerResponse = { data: [] };
export let selectedPlrs: string[] = [];

/**
 * Fetch all players from the API and store the list in allPlayersList.
 */
export async function fetchAllPlayers(): Promise<void> {
 try {
  const response = await fetch("/api/user/all");
  if (!response.ok) throw new Error("Network response was not ok");
  allPlayersList = await response.json();
 } catch (error) {
  console.error("Error fetching users:", error);
 }
}

/**
 * Initialize the user search functionality.
 *
 * @param searchInput - The input element for search queries.
 * @param resultsContainer - The container element where search results will be displayed.
 * @param onSelect - A callback invoked when a user is selected.
 */
export function initUserSearch(
 searchInput: HTMLInputElement,
 resultsContainer: HTMLDivElement,
 onSelect: (username: string) => void
): void {
 resultsContainer.innerHTML = "";
 resultsContainer.style.display = "none";

 searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  if (query.length < 2) {
   resultsContainer.style.display = "none";
   resultsContainer.innerHTML = "";
   return;
  }
  // Filter users from the fetched list.
  const filteredUsers: string[] = allPlayersList.data.filter((username) =>
   username.toLowerCase().includes(query)
  );
  displaySearchResults(filteredUsers, resultsContainer, onSelect);
 });
}

/**
 * Display search results in the provided container.
 *
 * @param users - Array of usernames matching the query.
 * @param container - The container where results should be rendered.
 * @param onSelect - Callback function when a username is clicked.
 */
function displaySearchResults(
 users: string[],
 container: HTMLDivElement,
 onSelect: (username: string) => void
): void {
 container.innerHTML = "";
 if (users.length === 0) {
  container.style.display = "none";
  return;
 }
 users.forEach((username) => {
  const div = document.createElement("div");
  div.textContent = username;
  div.className = "search-result-item";
  div.onclick = () => onSelect(username);
  container.appendChild(div);
 });
 container.style.display = "block";
}

export function updateSelectedUserUI(container: HTMLUListElement): void {
 container.innerHTML = "";
 selectedPlrs.forEach((player) => {
  const li = document.createElement("li");
  li.classList.add(
   "px-4",
   "py-2",
   "mx-1",
   "my-1",
   "rounded-lg",
   "font-semibold"
  );
  li.textContent = player;
  container.appendChild(li);
 });
}

/**
 * Add a username to the selected players list and update the UI.
 *
 * @param username - The username to add.
 * @param updateUI - Callback to update the UI after adding.
 */
export function selectPlayer(username: string, updateUI: () => void): void {
 if (!selectedPlrs.includes(username)) {
  selectedPlrs.push(username);
  updateUI();
 }
}
