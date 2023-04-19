//=====================SETTINGS=====================\\
let canvas;             //p5js (processing) canvas
let WFCManager;         //manages wave function collapse
let player;             //player ref

let seed;               //world gen seed
let seedOffset = 3;     //offset to use for randomness
let layer = 0;          //height level (0 = ground level)
let structure;          //currently open structure

let tiles;
let numOfTilesX = 16;   //how many tiles horizontally
let numOfTilesY = 16;   //how many tiles vertically
let scale;              //scale of tiles

let titleFont;              //title screen font
let showIntroScreen = true; //whether or not to show the title screen
//==================================================\\

function setup() {
  //canvas = createCanvas(windowWidth, windowHeight);
  //canvas = createCanvas(600, 600);
  resizeGame(true);
  scale = width / numOfTilesX;
  canvas.style('display', 'block');
  canvas.style('border-radius', '25px');
  canvas.parent("canvas");

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

  introScreen();

  player.draw();
}

function keyPressed() {
  if (WFCManager.isGenerating)
    return;

  switch (key) {

    case 'w':
    case 'W':
      player.move("up");
      break;

    case 's':
    case 'S':
      player.move("down");
      break;

    case 'a':
    case 'A':
      player.move("left");
      break;

    case 'd':
    case 'D':
      player.move("right");
      break;
  


    case ' ':
      player.teleport();
      break;

    case 'm':
    case 'M':
      player.useMap();
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

  textAlign(CENTER);
  titleFont = loadFont("Barriecito-Regular.ttf");
  textFont(titleFont);
}

function windowResized() {
  resizeGame(false);
}

function setupPlayer(x, y) {

  if (player == null) {
    player = new Player(x, y);
  }

  else {
    player.x = x;
    player.y = y;
  }

  player.spawnOn(tiles[x][y]);
}

function drawOnGrid(img, x, y) {
  image(img, scale * x + scale/2, scale * y + scale/2, scale, scale);
}

function resizeGame(justLoaded) {
  let smallerDimension = getSmaller(windowWidth, windowHeight);

  if (justLoaded) {
    canvas = createCanvas(smallerDimension, smallerDimension);
  }

  else {
    resizeCanvas(smallerDimension, smallerDimension);
  }
  scale = smallerDimension / getLarger(numOfTilesX, numOfTilesY);
}

function correctScale(smallerDimension) {
  return smallerDimension / 24;
}

function getSmaller(a, b) {
  if (a < b) {
    return a;
  }
  
  return b;
}

function getLarger(a, b) {
  if (a > b) {
    return a;
  }
  
  return b;
}

function introScreen() {
  if (!showIntroScreen) {
    return;
  }

  background('rgba(255, 255, 255, 0.8)');

  textSize(width*.22);
  fill(0);
  text("MuTaBLuS", width*.5, height*.45);

  textSize(width*.06);
  fill(40);
  //text("The world mutates when you aren't looking", width*.5, height*.65);
  text("WASD to move", width*.5, height*.65);
}