
const AISLE = 0;
const WALL = 1;
const VISITED = 2;
const PATH = 3;

function Coordinate(x, y){
  this.x = x;
  this.y = y;
}

function Maze(aisleW, aisleH){
  this.aisleW = aisleW;
  this.aisleH = aisleH;
  this.sizeW = aisleW * 2 + 1;
  this.sizeH = aisleH * 2 + 1;
  this.map = new Array(this.sizeW);
  for (let i = 0; i < this.map.length; i++) {
    this.map[i] = new Array(this.sizeH).fill(WALL);
  }
  this.wallList = new Array(0);
  this.parentmap = new Array(this.aisleW * this.aisleH);
  for (let i = 0; i < this.parentmap.length; i++) {
    this.parentmap[i] = i;
  }
  this.rectList = new Array(0);
  this.isGenerated = false;
};

//----------------------------------------------------------
// Reset
//----------------------------------------------------------

// reset all (and resize)
Maze.prototype.reset = function(aisleW, aisleH){
  this.aisleW = aisleW;
  this.aisleH = aisleH;
  this.sizeW = aisleW * 2 + 1;
  this.sizeH = aisleH * 2 + 1;
  this.map = new Array(this.sizeW);
  for (let i = 0; i < this.map.length; i++) {
    this.map[i] = new Array(this.sizeH).fill(WALL);
  }
  this.wallList = new Array(0);
  this.parentmap = new Array(this.aisleW * this.aisleH);
  for (let i = 0; i < this.parentmap.length; i++) {
    this.parentmap[i] = i;
  }
  this.rectList = new Array(0);
  this.isGenerated = false;
};

//----------------------------------------------------------
// Kruskal-based method
//----------------------------------------------------------

// shuffle wall list
Maze.prototype.shuffleWallList = function(){
  let temp;
  for (let i = 0; i < this.wallList.length; i++) {
    let j = randInt(i, this.wallList.length - 1);
    temp = this.wallList[i];
    this.wallList[i] = this.wallList[j];
    this.wallList[j] = temp;
  }
};

// get parent of aisle
Maze.prototype.parentOf = function(aisleId){
  while (1) {
    if (this.parentmap[aisleId] == aisleId) return aisleId;
    aisleId = this.parentmap[aisleId];
  }
};

// get aisleId from coordinate of map
Maze.prototype.getAisleIdfromCoord = function(x, y){
  if ((x * y) % 2 == 0) return -1; // not aisle
  return Math.floor(y / 2) * this.aisleW + Math.floor(x / 2);
};

// break wall
Maze.prototype.breakWall = function(){
  while (this.wallList.length > 0) {
    let aisle1, aisle2;
    let wall = this.wallList.pop();
    // 壁が垂直（x座標が偶数）ならば，壁の左右の通路IDを取得．そうでなければ壁の上下の通路IDを取得する．
    if (wall.x % 2 == 0) {
      aisle1 = this.getAisleIdfromCoord(wall.x - 1, wall.y);
      aisle2 = this.getAisleIdfromCoord(wall.x + 1, wall.y);
    }
    else {
      aisle1 = this.getAisleIdfromCoord(wall.x, wall.y - 1);
      aisle2 = this.getAisleIdfromCoord(wall.x, wall.y + 1);
    }
    // ２つの通路の親を比較．親が異なるなら壁を壊し，parent map を更新
    let p1 = this.parentOf(aisle1);
    let p2 = this.parentOf(aisle2);
    //console.log ("p1:"+p1,"p2:"+p2,"wall:"+wall.x,wall.y);
    if (p1 == p2) continue;
    //console.log("break wall");
    this.map[wall.x][wall.y] = AISLE;
    if (p1 < p2) {
      this.parentmap[p2] = p1;
    }
    else {
      this.parentmap[p1] = p2;
    }
  }
};

// create maze (Clustering)
Maze.prototype.createMazeWithClustering = function() {
  this.isGenerated = false;
  this.reset(this.aisleW, this.aisleH);
  // set maze map and create wall list
  for (let i = 0; i < this.sizeW; i++) {
    for (let j = 0; j < this.sizeH; j++) {
      this.map[i][j] = (i * j) % 2 == 0 ? WALL : AISLE;
      if (i != 0 && i != this.sizeW - 1 && j != 0 && j != this.sizeH - 1 && (i + j) % 2 == 1) {
        let newWall = new Coordinate(i, j);
        this.wallList.push(newWall);
      }
    }
  }
  // shuffle wall list
  this.shuffleWallList();
  // reset parent list
  for (let i = 0; i < this.parentmap.length; i++) {
    this.parentmap[i] = i;
  }
  // break wall
  this.breakWall();
  this.isGenerated = true;
};

//----------------------------------------------------------
// DFS recursive method
//----------------------------------------------------------

// DFS recursive function
Maze.prototype.createAisleWithDFS = function(x, y) {
  // direction list
  let direction = [
    {x:-2, y: 0},
    {x: 2, y: 0},
    {x: 0, y:-2},
    {x: 0, y: 2}
  ];
  // shuffle direction list
  for (let i = 0; i < 4; i++) {
    let j = randInt(i, 3);
    [direction[i], direction[j]] = [direction[j], direction[i]];
  }
  // make aisle recursively
  let newX, newY;
  for (let i = 0; i < 4; i++) {
    newX = x + direction[i].x;
    newY = y + direction[i].y;
    if (newX < 0 || this.sizeW <= newX || newY < 0 || this.sizeH <= newY) continue;
    if (this.map[newX][newY] == AISLE) continue;
    this.map[newX][newY] = AISLE;
    this.map[(x + newX) / 2][(y + newY) / 2] = AISLE;
    this.createAisleWithDFS(newX, newY);
  }
  return 0;
};

// create maze (random DFS path extending method)
Maze.prototype.createMazeWithDFS = function() {
  this.isGenerated = false;
  // reset maze map
  this.reset(this.aisleW, this.aisleH);
  // set start point
  let startX = randInt(0, this.aisleW - 1) * 2 + 1;
  let startY = randInt(0, this.aisleH - 1) * 2 + 1;
  // create maze with recursive DFS function
  this.map[startX][startY] = AISLE;
  this.createAisleWithDFS(startX, startY);
  this.isGenerated = true;
};

//----------------------------------------------------------
// Recursive division method
//----------------------------------------------------------

Maze.prototype.divideVertical = function(rect) {
  // 分ける箇所をランダムに決める
  let newRectX1 = randInt(rect.x0, rect.x1 - 1);
  // 新しい長方形領域を作成，rectListに入れる
  this.rectList.push({ // left
    x0: rect.x0,
    y0: rect.y0,
    x1: newRectX1,
    y1: rect.y1
  });
  this.rectList.push({ // right
    x0: newRectX1 + 1,
    y0: rect.y0,
    x1: rect.x1,
    y1: rect.y1
  });
  // 迷路マップに壁を作成，壁の１箇所に穴を開ける
  for (let i = rect.y0 * 2 + 1; i <= rect.y1 * 2 + 1; i++) {
    this.map[newRectX1 * 2 + 2][i] = WALL;
  }
  let hole = randInt(rect.y0, rect.y1) * 2 + 1;
  this.map[newRectX1 * 2 + 2][hole] = AISLE;
};

Maze.prototype.divideHorizontal = function(rect) {
  // 分ける箇所をランダムに決める
  let newRectY1 = randInt(rect.y0, rect.y1 - 1);
  // 新しい長方形領域を作成，rectListに入れる
  this.rectList.push({ // left
    x0: rect.x0,
    y0: rect.y0,
    x1: rect.x1,
    y1: newRectY1
  });
  this.rectList.push({ // right
    x0: rect.x0,
    y0: newRectY1 + 1,
    x1: rect.x1,
    y1: rect.y1
  });
  // 迷路マップに壁を作成，壁の１箇所に穴を開ける
  for (let i = rect.x0 * 2 + 1; i <= rect.x1 * 2 + 1; i++) {
    this.map[i][newRectY1 * 2 + 2] = WALL;
  }
  let hole = randInt(rect.x0, rect.x1) * 2 + 1;
  this.map[hole][newRectY1 * 2 + 2] = AISLE;
};

Maze.prototype.createMazeWithDivision = function() {
  this.isGenerated = false;
  // reset maze map
  this.reset(this.aisleW, this.aisleH);
  for (let i = 1; i < this.sizeW - 1; i++) {
    for (let j = 1; j < this.sizeH - 1; j++) {
      this.map[i][j] = AISLE;
    }
  }
  // set rectangle region list
  this.rectList.push({
    x0: 0,
    y0: 0,
    x1: this.aisleW - 1,
    y1: this.aisleH - 1
  });
  // dividing
  while (this.rectList.length > 0) {
    let rect = this.rectList.pop();
    // If the width/height of rectangle is 1, dividing is not execute.
    if (rect.x0 == rect.x1 || rect.y0 == rect.y1) continue;
    // Random dividing
    if (rect.x1 - rect.x0 >= rect.y1 - rect.y0) { // vertical division
      this.divideVertical(rect);
    }
    else {
      this.divideHorizontal(rect);
    }
  }
  this.isGenerated = true;
};


//----------------------------------------------------------
// path finder
//----------------------------------------------------------

// find path with DFS (recursive)
Maze.prototype.findPath = function(sx, sy, gx, gy) {
  // if the coodinate of start/goal is out of range, return 0
  if (sx < 0 || this.sizeW <= sx || sy < 0 || this.sizeH <= sy) return 0;
  if (gx < 0 || this.sizeW <= gx || gy < 0 || this.sizeH <= gy) return 0;
  // if start/goal is wall, return 0
  if (this.map[sx][sy] == WALL || this.map[sx][sy] == WALL) return 0;
  // if start and goal is match, return 1
  if (sx == gx && sy == gy){
    //console.log("goal!!");
    this.map[sx][sy] = PATH;
    return 1;
  }
  // mark (sx,sy)
  this.map[sx][sy] = VISITED;
  // find path around (sx,sy)
  let dx = [1, 0, -1, 0];
  let dy = [0, 1, 0, -1];
  for (let i = 0; i < 4; i++){
    if (this.map[sx + dx[i]][sy + dy[i]] == VISITED || this.map[sx + dx[i]][sy + dy[i]] == WALL) continue;
    if (this.findPath(sx + dx[i], sy + dy[i], gx, gy) == 1) {
      this.map[sx][sy] = PATH;
      return 1;
    }
  }
  return 0;
};

// random integer
// get random integer (min ~ max)
function randInt(min, max) {
  let minInt = Math.ceil(min);
  let maxInt = Math.floor(max);
  return Math.floor(Math.random() * (maxInt - minInt + 1)) + minInt;
}
