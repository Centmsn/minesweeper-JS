const board = document.querySelector(".game__board");
const startBtn = document.querySelector(".game__btn");

let firstClick = true;
let mines = null;
let size = null;
let clockId;
let leftWall = [];
let rightWall = [];

const detectBorder = (tiles, columns) => {
  size = columns;

  for (let i = 0; i < tiles.length; i += size) {
    leftWall.push(tiles[i]);
  }

  for (let i = size - 1; i < tiles.length; i += size) {
    rightWall.push(tiles[i]);
  }
};

const endGame = (e, mines) => {
  if (e.target.classList.contains("game__tile--marked")) {
    return;
  }
  mines.forEach((mine) => mine.classList.add("game__tile--bomb"));
  e.target.classList.remove("game__tile--bomb");
  e.target.classList.add("game__tile--explosion");

  const tiles = document.querySelectorAll(".game__tile");
  tiles.forEach((tile) => {
    tile.removeEventListener("click", checkTile);
    tile.removeEventListener("contextmenu", toggleFlag);
  });

  clearInterval(clockId);
};

const checkTile = (e) => {
  e.preventDefault();

  if (firstClick) {
    firstClick = false;
    generateMines(e.target);
  }

  if (e.target.classList.contains("game__tile--marked")) return;

  detectMines(parseInt(e.target.dataset.key));
  checkIfWin();
};

const checkIfWin = () => {
  const activeTiles = document.querySelectorAll(".game__tile--active");
  const mines = document.querySelectorAll(".game__tile--danger");

  if (activeTiles.length === mines.length) {
    clearInterval(clockId);
    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.innerHTML = `Victory! <br> Time: ${
      document.querySelector(".game__clock").textContent
    }s`;

    board.appendChild(modal);
  }
};

const toggleFlag = (e) => {
  e.preventDefault();
  const marked = "game__tile--marked";
  const flags = document.querySelectorAll(`.${marked}`);
  const flagsLeft = mines - (flags ? flags.length : 0);

  if (e.target.classList.contains("game__tile--inactive")) return;

  if (e.target.classList.contains(marked)) {
    e.target.classList.toggle(marked);
    updateCounter(flagsLeft + 1);
  } else if (!e.target.classList.contains(marked) && flagsLeft - 1 >= 0) {
    e.target.classList.toggle(marked);
    updateCounter(flagsLeft - 1);
  }
};

const detectMines = (target) => {
  const tiles = document.querySelectorAll(".game__tile");
  let filteredMines;

  const minesAround = [
    tiles[target + 1],
    tiles[target + size + 1],
    tiles[target - size + 1],
    tiles[target - size],
    tiles[target + size],
    tiles[target + size - 1],
    tiles[target - 1],
    tiles[target - size - 1],
  ];

  if (leftWall.includes(tiles[target])) {
    filteredMines = minesAround.slice(0, 5);
  } else if (rightWall.includes(tiles[target])) {
    filteredMines = minesAround.slice(3);
  } else {
    filteredMines = minesAround;
  }

  filteredMines = filteredMines.filter((el) => el !== undefined);

  const amountOfBombs = filteredMines.filter((el) =>
    el.classList.contains("game__tile--danger")
  );

  markTile(amountOfBombs.length, tiles[target], filteredMines);
  checkIfWin();
};

const markTile = (num, target, mines) => {
  let color;

  if (num === 0) {
    revealBlanks(mines);
  } else {
    if (target.children.length > 0) {
      return;
    }

    switch (num) {
      case 1:
        color = "blue";
        break;

      case 2:
        color = "green";
        break;

      case 3:
      case 4:
      case 5:
      case 6:
        color = "red";
        break;

      case 7:
      case 8:
        color = "brown";
    }

    const span = document.createElement("span");
    span.textContent = num;
    span.style.color = color;
    target.appendChild(span);
  }

  target.removeEventListener("click", checkTile);
  target.classList.remove("game__tile--active");
  target.classList.add("game__tile--inactive");
};

const revealBlanks = (tilesAround) => {
  const noInactive = tilesAround
    .filter((el) => !el.classList.contains("game__tile--inactive"))
    .filter((el) => !el.classList.contains("game__tile--marked"));

  for (let i = 0; i < noInactive.length; i++) {
    setTimeout(() => {
      detectMines(parseInt(noInactive[i].dataset.key));
    }, 10);
  }
};

const generateMines = (target) => {
  const tiles = document.querySelectorAll(".game__tile");
  const placedMines = [];
  let remainedMines = mines;
  let randomNum;

  const id = parseInt(target.dataset.key);

  // !Repeated code
  // !DRY
  const minesAround = [
    tiles[id + 1],
    tiles[id + size + 1],
    tiles[id - size + 1],
    tiles[id - size],
    tiles[id + size],
    tiles[id + size - 1],
    tiles[id - 1],
    tiles[id - size - 1],
  ];

  while (remainedMines > 0) {
    randomNum = getRandomNumber(tiles.length);
    while (
      placedMines.includes(tiles[randomNum]) ||
      randomNum == target.dataset.key ||
      minesAround.includes(tiles[randomNum])
    ) {
      randomNum = getRandomNumber(tiles.length);
    }

    placedMines.push(tiles[randomNum]);

    remainedMines--;
  }

  placedMines.forEach((tile) => {
    tile.addEventListener("click", (e) => endGame(e, placedMines));
    tile.removeEventListener("click", checkTile);
    tile.classList.add("game__tile--danger");
  });
};

const createTiles = (amount, columns) => {
  const fragmet = document.createDocumentFragment();
  const gridTemplate = `repeat(${columns}, 1fr)`;

  for (let i = 0; i < amount; i++) {
    const tile = document.createElement("div");
    tile.classList.add("game__tile", "game__tile--active");
    tile.dataset.key = i;
    tile.addEventListener("contextmenu", toggleFlag);
    tile.addEventListener("click", checkTile);

    fragmet.appendChild(tile);
  }

  board.appendChild(fragmet);
  board.style.gridTemplateColumns = gridTemplate;
};

const updateCounter = (num) => {
  const counter = document.querySelector(".game__counter");
  counter.textContent = num;
};

const setCounter = (amount) => {
  const counter = document.querySelector(".game__counter");

  switch (amount) {
    case 64:
      mines = 10;
      break;

    case 256:
      mines = 40;
      break;

    case 480:
      mines = 99;
      break;

    default:
      throw new Error("Incorrect argument value");
  }

  counter.textContent = mines;
};

const getRandomNumber = (range) => {
  return Math.floor(Math.random() * range);
};

const toggleOptionsVisibility = () => {
  const options = document.querySelector(".game__opt");
  const stats = document.querySelector(".game__stats");

  options.classList.toggle("game__opt--hidden");
  stats.classList.toggle("game__stats--hidden");
};

const newGame = () => {
  const clock = document.querySelector(".game__clock");
  const size = parseInt(document.querySelector(".game__size").value);
  const columns = size === 480 ? 30 : Math.sqrt(size);

  let time = 0;

  leftWall = [];
  rightWall = [];

  //   flag for first tile click in each game
  firstClick = true;

  board.innerHTML = "";
  clock.innerHTML = "";
  clock.textContent = "000";

  createTiles(size, columns);
  const tiles = document.querySelectorAll(".game__tile");
  setCounter(size);
  detectBorder(tiles, columns);

  if (clockId) {
    clearInterval(clockId);
  }

  clockId = setInterval(() => {
    time++;

    if (time > 999) {
      clearInterval(clockId);
      return;
    }

    clock.textContent = `${
      time < 100 ? (time < 10 ? "00" + time : "0" + time) : time
    }`;
  }, 1000);
};

newGame();
startBtn.addEventListener("click", newGame);
document
  .querySelectorAll(".game__options, .game__save")
  .forEach((btn) => btn.addEventListener("click", toggleOptionsVisibility));
