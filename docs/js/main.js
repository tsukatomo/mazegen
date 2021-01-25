
let algoMenu = document.getElementById("algo");
let sizeMenu = document.getElementById("size");
let createButton = document.getElementById("create");
let showPathButton = document.getElementById("showpath");
let canvas = document.getElementById('main_lay');
let ctx = canvas.getContext('2d');

const size = {
  "small":  {w: 20 , h: 15, aisle: 28, wall: 4},
  "medium": {w: 40 , h: 30, aisle: 14, wall: 2},
  "large":  {w: 80 , h: 60, aisle:  6, wall: 2}
};

let maze = new Maze(size["small"].w, size["small"].h); // グローバルな迷路オブジェクト

let isPathShown = false;
let currentSize = "small";

let resetCanvas = function () {
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

// drawing func
let drawMaze = function() {
  //console.log(dungeon.map);
  //console.log(dung.rectList);
  // if Maze has not generated yet, return
  if (!maze.isGenerated) return;
  // reset canvas
  resetCanvas();
  // draw dungeon map to canvas
  let aisleWidth = size[currentSize].aisle;
  let wallWidth = size[currentSize].wall;
  let drawWidth = (wallWidth + aisleWidth) * maze.aisleW + wallWidth;
  let drawHeight = (wallWidth + aisleWidth) * maze.aisleH + wallWidth;
  let rectX, rectY, rectW, rectH;
  for (let y = 0; y < maze.sizeH; y++) {
    for (let x = 0; x < maze.sizeW; x++) {
      ctx.fillStyle = maze.map[x][y] == WALL ? "black" : "white";
      if (isPathShown && maze.map[x][y] == PATH) {
        ctx.fillStyle = "royalblue";
      }
      rectX = x % 2 == 0 ? (wallWidth + aisleWidth) * (x / 2)
        : (wallWidth + aisleWidth) * ((x - 1) / 2) + wallWidth;
      rectX += (canvas.width - drawWidth) / 2;
      rectY = y % 2 == 0 ? (wallWidth + aisleWidth) * (y / 2)
        : (wallWidth + aisleWidth) * ((y - 1) / 2) + wallWidth;
      rectY += (canvas.height - drawHeight) / 2;
      rectW = x % 2 == 0 ? wallWidth : aisleWidth;
      rectH = y % 2 == 0 ? wallWidth : aisleWidth;
      ctx.fillRect(rectX, rectY, rectW, rectH);
    }
  }
};


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
  else {
    maze.createMazeWithClustering();
  }
  maze.findPath(1, 1, width * 2 - 1, height * 2 - 1);
  //console.log(maze.map);
  drawMaze();
});

// show path button
showPathButton.addEventListener('click', (e) => {
  isPathShown = !isPathShown;
  showPathButton.value = isPathShown ? "Hide Path" : "Show Path";
  drawMaze();
});
