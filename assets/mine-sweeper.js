// ╭─────────────────────╮
// │   mine-sweeper.js   │
// ╰─────────────────────╯

/**
 * @license MIT
 * @author DanielDH179
 * @version 1.0.0
 */

// HTML elements
const createButton = document.querySelector("#create");
const solveButton = document.querySelector("#solve");
const table = document.querySelector("table");
const timer = document.querySelector("#timer");
const victory = document.querySelector("#victory");
const debug = document.querySelector("#debug");

// Unicode characters
const uBlank = "\u{00020}";
const uFlag = "\u{00060}";
const uHidden = "\u{000A0}";
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
  clearInterval(interval);
  solveButton.addEventListener("click", solveGame);
  interval = resetTimer(totalTime);
  table.innerHTML = victory.innerHTML = "";
  let bombCounter = 0;
  timer.classList.remove("v3");
  for (let i = 0; i < width; i++) {
    let row = document.createElement("tr");
    for (let j = 0; j < height; j++) {
      let cell = document.createElement("td");
      cell.addEventListener("click", reveal);
      cell.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        if (!cell.className.includes("revealed")) cell.classList.toggle("flag");
      });
      if (Math.random() > sorter && bombCounter < totalBombs) {
        cell.innerText = uHidden;
        bombCounter++;
      } else cell.innerText = uBlank;
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
  if (bombCounter < totalBombs) newGame();
}

// Check clicked cell
function reveal(event) {
  let clicked = event.target;
  if (clicked.className.includes("flag")) return;
  if (clicked.innerText !== uHidden) {
    next(clicked);
    checkRemaining();
  } else {
    endGame(false);
    victory.innerText = "Nice try!";
    clicked.innerText = uExplosion;
  }
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

// Check neighbor cells
function next(element) {
  let x = element.parentNode.rowIndex;
  let y = element.cellIndex;
  let bombs = nearBombs(x, y);
  element.classList.add("revealed", `v${bombs}`);
  switch (bombs) {
    case 0:
      for (let cell of getNeighbors(x, y))
        if (!cell.classList.contains("revealed")) next(cell);
      break;
    default:
      element.innerText = bombs;
  }
}

// Count bombs next to current cell coordinates
function nearBombs(x, y) {
  let bombCounter = 0;
  for (let cell of getNeighbors(x, y))
    if (cell.innerText === uHidden || cell.innerText === uBomb) bombCounter++;
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
    cell.classList.remove("flag");
    if (cell.innerText === uHidden) cell.innerText = uBomb;
    else if (solution) next(cell);
  }
}

// Debug mode
function showDebug(text) {
  debug.innerText = text;
}
