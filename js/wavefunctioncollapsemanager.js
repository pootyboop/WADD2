//oversees all the WFC stuff
//a lot of the work is done on a per-tile basis in Tile, which this class is heavily interconnected with
class WaveFunctionCollapseManager {
  constructor() {
      //is WFC currently in progress
      this.isGenerating = false;

      //immediately generate a world and plop the player down dead center
      this.WFC(numOfTilesX/2, numOfTilesY/2)
  }

  //master WFC function
  //calls everything necessary for putting the player in a new world
  WFC(x, y) {
      //generating mode: activated
      this.isGenerating = true;


      //================ SETUP ================
      //tell the player we're loading
      this.loadingScreen();

      //set all tiles to their default, uncollapsed state
      this.initTiles();
      //generate a new seed
      this.newSeed();
      //================================


      //================ WFC ================
      //all tiles start with an equal superposition, so arbitrarily pick a tile to collapse
      this.collapseInitial(numOfTilesX/2, numOfTilesY/2);
      //now that a tile has been collapsed, go through and collapse everything else
      this.collapseAllTiles();
      //================================


      //================ QC ================
      //polish WFC's raw output on a per-Tile basis through multiple quality passes
      this.qualityControl();
      //================================


      //================ PLAYER ================
      //place our player wherever we specified in the params
      setupPlayer(x, y);
      //================================


      //generating mode: deactivated
      this.isGenerating = false;
  }

  //cleans up terrain, adds biomes and points of interest, and makes other small changes
  //order of operations is IMPORTANT here! do NOT reorder these functions
  qualityControl() {
    //majority of changes come from the following two quality passes
    //these iterate through Tiles at this higher level so that passes are distinct
    //changes from the first pass will be recognised by the second pass

    //biomes and general individualistic changes to tiles
    this.firstPass();

    //individualistic changes to tiles that need to happen AFTER firstPass()
    //if something doesn't need to happen in secondPass(), put it in Tile.firstPass()
    this.secondPass();

    //clean up some WFC ugliness
    //do this after quality passes since the affected (isolated) tiles will probably be DIFFERENT after quality passes
    this.removeIsolated();
  }

  //simple loading screen for the player to see while the world generates and loads tile images
  //the tiles actually generate over the "Loading" text in real time which sometimes creates a cool effect like the world is being built piece by piece
  //if you have a decent computer you may unfortunately be excluded from seeing this
  loadingScreen() {
    background(20);
    textSize(100);
    fill(100);
    text("LoaDiNg...", width*.5,height*.5);
  }

  //initialise tiles[][] and set all tiles to their superposition (uncollapsed) state
  initTiles() {
    tiles = new Array(numOfTilesX);
    
    for (let i = 0; i < numOfTilesX; i++) {
      tiles[i] = new Array(numOfTilesY);
      
      for (let j = 0; j < numOfTilesY; j++) {
        tiles[i][j] = new Tile(i, j);
      }
    }
    
    for (let i = 0; i < numOfTilesX; i++) {
      for (let j = 0; j < numOfTilesY; j++) {
        tiles[i][j].setAdjacent();
      }
    }
  }

  //generate a seed
  newSeed() {
    //seedOffset is used by Tile.seedRandom() to create deterministic pseudorandom values and will be modified throughout world generation
    seedOffset = 3;

    //ONLY generate a seed if we are on layer 0, which is the default outdoors level
    //if level !== 0, we're not outdoors and therefore do not need a new seed
    //this also results in randomised elements of structure interiors generating deterministically based on the outdoors seed...
    //...and theoretically means you can walk outside to the same seed you entered from. neat!
    if (layer === 0) {
        //this Math.random() call should be the ONLY one used for ANYTHING related to worldgen to ensure seeds are reproducable
        //i count maps as an exception because i believe they work more like a player's item than an element of the world
        seed = Math.floor(Math.random() * 99999999);
    }
  }

  //collapses a tile at the specified location
  //used to kick off WFC, should not be called for any other reason
  collapseInitial(x, y) {
    tiles[x][y].collapsePossibilities();
  }

  //99% of what WFC does
  //collapses every tile besides the first one
  //theoretically, you should be able to call this without calling collapseInitial() prior
  //but you get more varied seeds by letting the centre tile be more random
  collapseAllTiles() {
      while (true) {
        let currentTile = this.getBestCollapsableTile();
        
        if (currentTile != null) {
          //the best collapsable tile is indeed an actual tile. collapse it!
          currentTile.collapsePossibilities();
        }
        
        //no tiles left? return
        else {
          return;
        }
      }
  }

  //finds the best tile to collapse,
  //meaning the tile in superposition with the lowest number of possibilities
  //returns null if nothing is worthy of collapsing
  getBestCollapsableTile() {
    //starts out as null, so if the for loops can't find anything, we return null
    //this tells collapseAllTiles() that we have collapsed everything we can
    let collapsableTile = null;
    //arbitrarily high number to ensure any collapsable tile will have less possibilities
    let numOfPossibilities = 1000;
    
    for (let i = 0; i < numOfTilesX; i++) {
      for (let j = 0; j < numOfTilesY; j++) {
        let currentTile = tiles[i][j];
        //if the current tile has possibilities, those possibilities are fewer than anything we've found so far, and is in superposition (meaning not yet collapsed)
        if (currentTile.possibilities.length !== 0 && currentTile.possibilities.length < numOfPossibilities && !currentTile.collapsed) {
          //then we have a new best tile!
          collapsableTile = currentTile;
          numOfPossibilities = collapsableTile.possibilities.length;
        }
      }
    }
    
    return collapsableTile;
  }

  //call firstPass on all tiles
  firstPass() {
    for (let i = 0; i < numOfTilesX; i++) {
      for (let j = 0; j < numOfTilesY; j++) {
        tiles[i][j].firstPass();
      }
    }
  }
    
  //call secondPass on all tiles
  secondPass() {
    for (let i = 0; i < numOfTilesX; i++) {
      for (let j = 0; j < numOfTilesY; j++) {
        tiles[i][j].secondPass();
      }
    }
  }
    
  //call removeIsolated on all tiles
  removeIsolated() {
    for (let i = 0; i < numOfTilesX; i++) {
      for (let j = 0; j < numOfTilesY; j++) {
        tiles[i][j].removeIsolated();
      }
    }
  }

}