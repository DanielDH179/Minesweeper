// ╭─────────────────────╮
// │   mine-sweeper.js   │
// ╰─────────────────────╯

/**
 * @license MIT
 * @author DanielDH179
 * @version 1.1.0
 */

// HTML elements
const createButton = document.querySelector("#create");
const solveButton = document.querySelector("#solve");
const table = document.querySelector("table");
const timer = document.querySelector("#timer");
const victory = document.querySelector("#victory");

// Unicode characters
const uBomb = "\u{1F4A3}";
const uExplosion = "\u{1F4A5}";

// Game configuration
const totalTime = 999;
const width = 10;
const height = 10;
const sorter = 0.8;
const neighbors = [
  [-1, 1],
  [0, 1],
  [1, 1],
  [-1, 0],
  [1, 0],
  [-1, -1],
  [0, -1],
  [1, -1],
];

let totalBombs = Math.round(height * width * (1 - sorter));
let interval = resetTimer(totalTime);
let matrix = [];

// Restart game timer
function resetTimer(seconds) {
  timer.innerText = seconds;
  return setInterval(() => {
    timer.innerText = (--seconds).toString().padStart(3, "0");
    switch (seconds) {
      case 60:
        timer.classList.add("v3");
        break;
      case 0:
        endGame(false);
        victory.innerText = "Game over!";
        break;
    }
  }, 1000);
}

const solveGame = () => endGame(true);
createButton.addEventListener("click", newGame);
newGame();

// Create new game
function newGame() {
  setup();
  let bombCounter = 0;
  for (let i = 0; i < width; i++) {
    let row = document.createElement("tr");
    for (let j = 0; j < height; j++) {
      let cell = document.createElement("td");
      cell.addEventListener("click", reveal);
      cell.addEventListener("contextmenu", placeFlag);
      if (Math.random() > sorter && bombCounter < totalBombs) {
        matrix.push(1);
        bombCounter++;
      } else matrix.push(0);
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
  if (bombCounter < totalBombs) newGame();
}

// Setup variables
function setup() {
  clearInterval(interval);
  solveButton.addEventListener("click", solveGame);
  table.innerHTML = victory.innerHTML = "";
  timer.classList.remove("v3");
  interval = resetTimer(totalTime);
  matrix.length = 0;
}

// Flag right-clicked cell
function placeFlag(event) {
  event.preventDefault();
  let cell = event.target;
  if (!cell.className.includes("revealed")) cell.classList.toggle("flag");
}

// Check clicked cell
function reveal(event) {
  let clicked = event.target;
  let [x, y] = getCoordinates(clicked);
  if (clicked.className.includes("flag")) return;
  if (matrix[x * height + y] === 0) {
    next(clicked);
    checkRemaining();
  } else {
    endGame(false);
    victory.innerText = "Nice try!";
    clicked.innerText = uExplosion;
  }
}

// Check neighbor cells
function next(element) {
  let [x, y] = getCoordinates(element);
  let bombs = nearBombs(x, y);
  element.classList.add("revealed", `v${bombs}`);
  element.classList.remove("flag");
  switch (bombs) {
    case 0:
      for (let cell of getNeighbors(x, y))
        if (!cell.classList.contains("revealed")) next(cell);
      break;
    default:
      element.innerText = bombs;
  }
}

// Current cell coordinates
function getCoordinates(element) {
  return [element.parentNode.rowIndex, element.cellIndex];
}

// Check remaining cells
function checkRemaining() {
  let cells = document.querySelectorAll("td");
  let revealed = 0;
  for (let cell of cells) if (cell.className.includes("revealed")) revealed++;
  let remaining = height * width - revealed;
  if (remaining === totalBombs) {
    endGame(false);
    victory.innerText = "You win!";
  }
}

// Count bombs next to current cell coordinates
function nearBombs(x, y) {
  let bombCounter = 0;
  for (let cell of getNeighbors(x, y)) {
    let [nx, ny] = getCoordinates(cell);
    if (matrix[nx * height + ny] === 1) bombCounter++;
  }
  return bombCounter;
}

// Get neighbor cells from current cell coordinates
function getNeighbors(x, y) {
  let array = [];
  for (let [dx, dy] of neighbors) {
    let nx = x + dx;
    let ny = y + dy;
    if (nx >= 0 && nx < width && ny >= 0 && ny < height)
      array.push(table.children[nx].children[ny]);
  }
  return array;
}

// Finish current game
function endGame(solution) {
  clearInterval(interval);
  solveButton.removeEventListener("click", solveGame);
  const cells = document.querySelectorAll("td");
  for (let cell of cells) {
    cell.removeEventListener("click", reveal);
    cell.removeEventListener("contextmenu", placeFlag);
    cell.classList.remove("flag");
    let [x, y] = getCoordinates(cell);
    if (matrix[x * height + y] === 1) cell.innerText = uBomb;
    else if (solution) next(cell);
  }
}
