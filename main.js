const board = document.querySelector(".game__board");
const startBtn = document.querySelector(".game__btn");

let firstClick = true;
let mines = null;
let size = null;
let clockId;
let leftWall = [];
let rightWall = [];

const detectBorder = () => {
  const tiles = document.querySelectorAll(".game__tile");
  switch (mines) {
    case 10:
      size = 8;
      break;

    case 40:
      size = 16;
      break;

    case 99:
      size = 30;
      break;
  }

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
    tile.removeEventListener("contextmenu", setFlag);
    tile.removeEventListener("contextmenu", removeFlag);
    // TODO: remove endGame listener
  });
};

const checkTile = (e) => {
  e.preventDefault();

  if (firstClick) {
    firstClick = false;

    generateMines(e.target);
  }

  detectMines(parseInt(e.target.dataset.key));
  checkIfWin();
};

const checkIfWin = () => {
  const activeTiles = document.querySelectorAll(".game__tile--active");
  const mines = document.querySelectorAll(".game__tile--danger");

  if (activeTiles.length === mines.length) {
    console.log("win");
  }
};

const setFlag = (e) => {
  e.preventDefault();

  if (updateCounter(false)) {
    if (e.target.classList.contains("game__tile--inactive")) return;

    e.target.classList.add("game__tile--marked");
    e.target.removeEventListener("click", checkTile);
    e.target.addEventListener("contextmenu", removeFlag);
  }
};

const removeFlag = (e) => {
  e.preventDefault();

  if (updateCounter(true)) {
    e.target.classList.remove("game__tile--marked");
    e.target.removeEventListener("contextmenu", removeFlag);
    e.target.addEventListener("click", checkTile);
  }
};

const detectMines = (target) => {
  const tiles = document.querySelectorAll(".game__tile");
  let filteredMines;

  // console.log(target);

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

  // return filteredMines.length;
  markTile(amountOfBombs.length, tiles[target], filteredMines);
};

const markTile = (num, target, mines) => {
  console.log(num);
  let color;

  if (num === 0) {
    revealBlanks(mines);
  } else {
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

    if (target.children.length > 0) {
      return;
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
  const noInactive = tilesAround.filter(
    (el) => !el.classList.contains("game__tile--inactive")
  );

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
  let range, randomNum;

  switch (mines) {
    case 10:
      range = 64;
      break;

    case 40:
      range = 256;
      break;

    case 99:
      range = 480;
      break;

    default:
      break;
  }

  while (remainedMines > 0) {
    randomNum = getRandomNumber(range);
    while (
      placedMines.includes(tiles[randomNum]) ||
      randomNum == target.dataset.key
    ) {
      randomNum = getRandomNumber(range);
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

const createTiles = (amount) => {
  const fragmet = document.createDocumentFragment();
  let gridTemplate = "";

  for (let i = 0; i < amount; i++) {
    const tile = document.createElement("div");
    tile.classList.add("game__tile", "game__tile--active");
    tile.dataset.key = i;
    tile.addEventListener("contextmenu", setFlag);
    tile.addEventListener("click", checkTile);

    fragmet.appendChild(tile);
  }

  board.appendChild(fragmet);

  switch (amount) {
    case 64:
      gridTemplate = "repeat(8, 1fr)";
      break;

    case 256:
      gridTemplate = "repeat(16, 1fr)";
      break;

    default:
      gridTemplate = "repeat(30, 1fr)";
  }

  board.style.gridTemplateColumns = gridTemplate;
};

const updateCounter = (add) => {
  const counter = document.querySelector(".game__counter");
  const flags = document.querySelectorAll(".game__tile--marked");
  const flagsLeft = mines - flags.length;

  if (!add && flagsLeft - 1 >= 0) {
    counter.textContent = flagsLeft - 1;
    return true;
  } else if (add) {
    counter.textContent = flagsLeft + 1;
    return true;
  }
  return false;
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

const newGame = () => {
  const clock = document.querySelector(".game__clock");
  const size = parseInt(document.querySelector(".game__size").value);
  let time = 0;

  //   flag for first tile click in each game
  firstClick = true;

  board.innerHTML = "";
  clock.innerHTML = "";

  createTiles(size);
  setCounter(size);
  detectBorder();

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
