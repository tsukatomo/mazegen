
//============================================================================
// Get element from html
//============================================================================

let algoMenu = document.getElementById("algo");
let sizeMenu = document.getElementById("size");
let createButton = document.getElementById("create");
let showPathButton = document.getElementById("showpath");
let showCharacterButton = document.getElementById("showcharacter");
let mainCanvas = document.getElementById('main_lay');
let mainCtx = mainCanvas.getContext('2d');
let characterCanvas = document.getElementById('character_lay');
let characterCtx = characterCanvas.getContext('2d');

//============================================================================
// Define variables
//============================================================================

const size = {
  "small":  {w: 20 , h: 15, aisle: 28, wall: 4},
  "medium": {w: 40 , h: 30, aisle: 14, wall: 2},
  "large":  {w: 80 , h: 60, aisle:  6, wall: 2}
};

let maze = new Maze(size["small"].w, size["small"].h); // global maze object
let goal = {
  x: size["small"].w * 2 - 1,
  y: size["small"].h * 2 - 1,
};

let isPathShown = false;
let currentSize = "small";

let player = { // player character of "exploration mode"
  x: 1,
  y: 1
};

let trace = new Array(size["small"].w * 2 + 1);
for (let i = 0; i < trace.length; i++) {
  trace[i] = new Array(size["small"].h * 2 + 1).fill(false);
};

let isTraceShown = true;
let isCharacterShown = true;

//============================================================================
// Maze drawing function
//============================================================================

let resetMainCanvas = function () {
  mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
};

// Get rectangle coordinate and size from coordinate of maze map
let getRectangleFromCoord = function(x, y) {
  let aisleWidth = size[currentSize].aisle;
  let wallWidth = size[currentSize].wall;
  let drawWidth = (wallWidth + aisleWidth) * maze.aisleW + wallWidth;
  let drawHeight = (wallWidth + aisleWidth) * maze.aisleH + wallWidth;
  let rectX, rectY, rectW, rectH;
  // calculate drawing position x
  rectX = x % 2 == 0 ? (wallWidth + aisleWidth) * (x / 2)
    : (wallWidth + aisleWidth) * ((x - 1) / 2) + wallWidth;
  rectX += (mainCanvas.width - drawWidth) / 2;
  // calculate drawing position y
  rectY = y % 2 == 0 ? (wallWidth + aisleWidth) * (y / 2)
    : (wallWidth + aisleWidth) * ((y - 1) / 2) + wallWidth;
  rectY += (mainCanvas.height - drawHeight) / 2;
  // calculate drawing width
  rectW = x % 2 == 0 ? wallWidth : aisleWidth;
  // calculate drawing height
  rectH = y % 2 == 0 ? wallWidth : aisleWidth;
  return {
    x: rectX,
    y: rectY,
    w: rectW,
    h: rectH
  };
};

// drawing func
let drawMaze = function() {
  //console.log(dungeon.map);
  //console.log(dung.rectList);
  // if Maze has not generated yet, return
  if (!maze.isGenerated) return;
  // reset canvas
  resetMainCanvas();
  // draw dungeon map to canvas
  let rect;
  for (let y = 0; y < maze.sizeH; y++) {
    for (let x = 0; x < maze.sizeW; x++) {
      mainCtx.fillStyle = maze.map[x][y] == WALL ? "black" : "white";
      if (isPathShown && maze.map[x][y] == PATH) {
        mainCtx.fillStyle = "aquamarine";
      }
      rect = getRectangleFromCoord(x, y);
      mainCtx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
  }
  drawCharacter();
};

//============================================================================
// Function for exploration mode
//============================================================================

let resetCharacterCanvas = function () {
  characterCtx.clearRect(0, 0, characterCanvas.width, characterCanvas.height);
};

let d2rad = function(d) {
  return d * Math.PI / 180;
};

let drawTrace = function() {
  characterCtx.fillStyle = "orange";
  for (let x = 1; x < trace.length; x += 2) {
    for (let y = 1; y < trace[x].length; y += 2) {
      if (!trace[x][y]) continue;
      let rect = getRectangleFromCoord(x, y);
      characterCtx.fillRect(
        rect.x + rect.w / 2 - 2,
        rect.y + rect.h / 2 - 2,
        4,
        4
      );
    }
  }
};

let drawPlayer = function() {
  let rect = getRectangleFromCoord(player.x, player.y);
  characterCtx.fillStyle = "red";
  if (currentSize == "large") {
    characterCtx.fillRect(rect.x, rect.y, rect.w, rect.h);
  }
  else {
    characterCtx.beginPath();
    characterCtx.arc(
      rect.x + rect.w / 2,
      rect.y + rect.h / 2,
      rect.w / 2 - 1,
      d2rad(0),
      d2rad(360),
      false
    );
    characterCtx.fill();
  }
};

let drawGoal = function() {
  let rect = getRectangleFromCoord(goal.x, goal.y);
  if (currentSize == "large") {
    characterCtx.fillStyle = "royalblue";
    characterCtx.fillRect(rect.x, rect.y, rect.w, rect.h);
  }
  else {
    characterCtx.strokeStyle = "royalblue";
    characterCtx.lineWidth = 4.0;
    characterCtx.beginPath();
    characterCtx.arc(
      rect.x + rect.w / 2,
      rect.y + rect.h / 2,
      rect.w / 2 - 1,
      d2rad(0),
      d2rad(360),
      false
    );
    characterCtx.stroke();
  }
};

let drawCharacter = function() {
  // if Maze has not generated yet, return
  if (!maze.isGenerated) return;
  // reset canvas
  resetCharacterCanvas();
  if (!isCharacterShown) return;
  // draw trace
  if (isTraceShown) drawTrace();
  // draw character icon
  drawPlayer();
  drawGoal();
};


let move = function(direction) {
  let toX = player.x;
  let toY = player.y;
  switch (direction) {
    case "up":
      toY -= 2;
      break;
    case "down":
      toY += 2;
      break;
    case "left":
      toX -= 2;
      break;
    case "right":
      toX += 2;
      break;
    default:
      break;
  }
  if (maze.map[(player.x + toX) / 2][(player.y + toY) / 2] == WALL) {
    return 1;
  }
  trace[player.x][player.y] = true;
  player.x = toX;
  player.y = toY;
  return 0;
};

// trace
let resetTrace = function() {
  trace = new Array(size[currentSize].w * 2 + 1);
  for (let i = 0; i < trace.length; i++) {
    trace[i] = new Array(size[currentSize].h * 2 + 1).fill(false);
  }
};

//============================================================================
// Event listener
//============================================================================

// create button
createButton.addEventListener('click', (e) => {
  currentSize = sizeMenu.value;
  // create
  let width = size[currentSize].w;
  let height = size[currentSize].h;
  maze.reset(width, height);
  if (algoMenu.value == "dfs") {
    maze.createMazeWithDFS();
  }
  else if (algoMenu.value == "kruskal") {
    maze.createMazeWithClustering();
  }
  else {
    maze.createMazeWithDivision();
  }
  goal = {
    x: width * 2 - 1,
    y: height * 2 - 1,
  };
  maze.findPath(1, 1, goal.x, goal.y);
  //console.log(maze.map);
  drawMaze();
  // reset character position
  player.x = 1;
  player.y = 1;
  resetTrace();
  drawCharacter();
});

// show path button
showPathButton.addEventListener('click', (e) => {
  isPathShown = !isPathShown;
  showPathButton.value = isPathShown ? "Hide path" : "Show path";
  drawMaze();
});

// show charavter button
showCharacterButton.addEventListener('click', (e) => {
  isCharacterShown = !isCharacterShown;
  showCharacterButton.value = isCharacterShown ? "Hide object" : "Show object";
  drawCharacter();
});

// keydown event
window.addEventListener("keydown", (e) => {
  if (e.defaultPrevented) return;
  if (!maze.isGenerated) return;
  if (!isCharacterShown) return;
  if (e.code === "Enter" || e.code === "Tab" || e.code === "Space") {
    return;
  }
  //console.log(e.code);
  keyCommand(e.code);
  drawCharacter();
  if (!e.metaKey && !e.shiftKey && !e.ctrlKey){
    e.preventDefault();
  }
});

let keyCommand = function (keyCode) {
  switch (keyCode) {
    case "ArrowUp":
      move("up");
      break;
    case "ArrowDown":
      move("down");
      break;
    case "ArrowLeft":
      move("left");
      break;
    case "ArrowRight":
      move("right");
      break;
    case "KeyZ":
      isTraceShown = !isTraceShown;
      break;
    default:
      break;
  }
};
