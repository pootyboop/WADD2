//=====================SETTINGS=====================\\
let canvas;
let WFCManager;
let player;

let seed, seedOffset; //seed and offset to use for randomness
let layer = 0;  //height level (0 = ground level)
let structure;

let tiles;
let numOfTilesX = 16;  //how many tiles horizontally
let numOfTilesY = 16;  //how many tiles vertically
let scale = 25;        //scale of tiles
//==================================================\\

function setup() {
  //canvas = createCanvas(windowWidth, windowHeight);
  canvas = createCanvas(600, 600);
  scale = width / numOfTilesX;
  canvas.style('display', 'block');

  drawingSetup();
  WFCManager = new WaveFunctionCollapseManager();
  
  //WFC(numOfTilesX/2, numOfTilesY/2);
}

function draw() {
  for (let i = 0; i < numOfTilesX; i++) {
    for (let j = 0; j < numOfTilesY; j++) {
      tiles[i][j].draw();
      //console.log("   Drew " + tiles[i][j].properties[0] + " (x = " + tiles[i][j].x + ", y = " + tiles[i][j].y + ")");
    }
  }

  player.draw();
}

function keyPressed() {
  if (WFCManager.isGenerating)
    return;

  switch (key) {

    case 'w':
      player.move("up");
      break;

    case 's':
      player.move("down");
      break;

    case 'a':
      player.move("left");
      break;

    case 'd':
      player.move("right");
      break;
  


    case ' ':
      layer = 0;
      WFCManager.WFC(player.x, player.y);
      break;
  }

  switch (keyCode) {

    case UP_ARROW:
      player.move("up");
      break;

    case DOWN_ARROW:
      player.move("down");
      break;

    case LEFT_ARROW:
      player.move("left");
      break;

    case RIGHT_ARROW:
      player.move("right");
      break;
  


    case ' ':
      WFC(player.x, player.y);
      break;
  }
}

function drawingSetup() {
  rectMode(CENTER);
  imageMode(CENTER);

  noStroke();
  noSmooth();
}

/*
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
*/

function setupPlayer(x, y) {

  if (player == null) {
    player = new Player(x, y);
  }

  else {
    player.x = x;
    player.y = y;
  }
}

function drawOnGrid(img, x, y) {
  image(img, scale * x + scale/2, scale * y + scale/2, scale, scale);
}