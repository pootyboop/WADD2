//=====================SETTINGS=====================\\
let canvas;             //p5js (processing) canvas
let WFCManager;         //manages wave function collapse (procedural world generation)
let player;             //player ref

let seed;               //world gen seed
let seedOffset = 3;     //offset to use for randomness
let layer = 0;          //layer is a bit of a weird variable
                        //it's meant to represent how high the player is vertically (0 being ground floor)
                        //but is really only used in practice to denote whether the player is indoors or not
                        //not to mention that most ingame structures sit at ground level... hmm.
let structure;          //currently open structure

let tiles;
let numOfTilesX = 16;   //how many tiles are on-screen horizontally
let numOfTilesY = 16;   //how many tiles are on-screen vertically
                        //IMPORTANT: numOfTilesX = numOfTilesY (a square resolution) is safest for screen resizing purposes
                        //numOfTilesX/Y should be even numbers -- odd numbers are UNTESTED for structure compatibility
                        //numOfTilesX/Y should be 16 or higher for large structures to work safely
let scale;              //visual scale of tiles

let titleFont;              //title screen font
let showIntroScreen = true; //whether or not to show the title screen
//==================================================\\

//same as processing
function setup() {
  //initialise canvas
  resizeGame(true);
  //canvas CSS setup
  canvasStyling();

  //basic processing setup
  drawingSetup();

  //start WFC
  WFCManager = new WaveFunctionCollapseManager();
}

//same as processing
function draw() {
  //draw all tiles onscreen
  drawTiles();
  
  //screen displayed on opening the game
  introScreen();

  //draw player on top of introscreen to highlight them at the start
  player.draw();
}

//same as processing
function keyPressed() {

  //ignore input while WFC is in progress
  if (WFCManager.isGenerating)
    return;

  switch (key) {

    //==========WASD MOVEMENT==========
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
    //====================

    //teleport with orb
    case ' ':
      player.teleport();
      break;

    //use map to reveal structure
    case 'm':
    case 'M':
      player.useMap();
      break;
  }

  switch (keyCode) {

    //==========ARROW KEY MOVEMENT==========
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
    //====================
  }
}

//basic processing setup
function drawingSetup() {
  //draw tiles from center
  rectMode(CENTER);
  imageMode(CENTER);

  //don't outline tiles
  noStroke();

  //don't compress pixel art
  noSmooth();

  //font setup
  textAlign(CENTER);
  titleFont = loadFont("js/Barriecito-Regular.ttf");
  textFont(titleFont);
}

//puts the player at the specified coords
//spawns the player if no player currently exists
//x,y refers to TILE INDEX, NOT PIXEL LOCATION
function setupPlayer(x, y) {

  //spawn player if necessary
  if (player == null) {
    player = new Player(x, y);
  }

  //otherwise just teleport them
  else {
    player.x = x;
    player.y = y;
  }

  //clean up the tile beneath the player's feet
  player.spawnOn(tiles[x][y]);
}

//draws an image at the specified tile index.
//as is the case with setupPlayer and most instances of (x, y),
//x and y refer to position in tiles[x][y] independent of actual pixel location.
//this allows scale to change easily.
function drawOnGrid(img, x, y) {
  image(img, scale * x + scale/2, scale * y + scale/2, scale, scale);
}

//event called whenever the window is resized
function windowResized() {
  resizeGame(false);
}

//fits the game to fill the smaller window dimension
//and scales all tiles and the player to fill the space
//justLoaded should be false in all cases EXCEPT when called from setup()
function resizeGame(justLoaded) {
  //figure out what the smaller dimension is
  let smallerDimension = getSmaller(windowWidth, windowHeight);

  //create the canvas if necessary
  //should only do this when called from setup
  if (justLoaded) {
    canvas = createCanvas(smallerDimension, smallerDimension);
  }

  //otherwise just resize our current canvas to fill as much space as it safely can
  else {
    resizeCanvas(smallerDimension, smallerDimension);
  }

  //finally, resize all in-game images to match
  //getLarger() is supposed to help with non-square tiles[][] resolutions but it's still best to use a square resolution
  scale = smallerDimension / getLarger(numOfTilesX, numOfTilesY);
}

//CSS for canvas
//fairly self-explanatory
function canvasStyling() {
  canvas.style('display', 'block');
  //rounded corners
  canvas.style('border-radius', '25px');
  canvas.parent("canvas");
}

//draws all tiles to the screen
function drawTiles() {
  for (let i = 0; i < numOfTilesX; i++) {
    for (let j = 0; j < numOfTilesY; j++) {
      tiles[i][j].draw();
    }
  }
}

//returns the smaller param
function getSmaller(a, b) {
  if (a < b) {
    return a;
  }
  
  return b;
}

//returns the larger param
function getLarger(a, b) {
  if (a > b) {
    return a;
  }
  
  return b;
}

//screen displayed on canvas before the player moves
function introScreen() {
  if (!showIntroScreen) {
    return;
  }

  //transparent white filter covers tiles to draw attention to text and player
  background('rgba(255, 255, 255, 0.8)');

  //title
  textSize(width*.22);
  fill(0);
  text("MuTaBLuS", width*.5, height*.45);

  //player spawns between these texts
  //unfortunately a bit off-center due to even-numbered tile grid having no central tile

  //"WASD to move" text
  textSize(width*.06);
  fill(40);
  text("WASD to move", width*.5, height*.65);
}