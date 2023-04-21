//manages player interactions and draws player onscreen
//lots of dependencies with Tile
class Player {

  constructor(x, y) {
    //index of occupied tile on tiles[][], NOT PIXEL LOCATION!!!
    this.x = x;
    this.y = y;

    //inventory
    this.inventory = new Inv();

    this.img = loadImage('images/Player.png');
  }

  draw() {
    //i had hoped this would stop the game from drawing the player while WFC is running
    //unfortunately it does not seem to work
    if (WFCManager.isGenerating) {
      return;
    }

    //draw player sprite
    drawOnGrid(this.img, this.x, this.y);
  }

  //move the player one tile in a specified direction
  //if something interactable is in the way, interact() will deal with it
  //if the player walks offscreen, generate a new seed and spawn the player across the screen pacman-style
  move(direction) {
    this.receivedInput();

    //the tile we wanna move to
    let targetTile;

    //parse the dumb inefficient string i sent from keyPressed()
    //and ask checkMove() if we can move the player to the target location
    switch (direction) {

      case "up":
        targetTile = this.checkMove(this.x, this.y-1);
        break;

      case "down":
        targetTile = this.checkMove(this.x, this.y+1);
        break;

      case "left":
        targetTile = this.checkMove(this.x-1, this.y);
        break;

      case "right":
        targetTile = this.checkMove(this.x+1, this.y);
        break;

    }

    //if checkMove() gave us a return, try to interact with it by calling interact()
    if (targetTile != null) {
      let shouldMove = this.interact(targetTile);

      //interact() returns a boolean of whether the target tile is traversable or not. the player only moves if interact() says they can
      if (shouldMove) {
        this.x = targetTile.x;
        this.y = targetTile.y;
      }
    }

    //and if checkMove() gave us null, then the player walked offscreen and WFC dealt with it. nothing else for us to worry about!
  }

  //checks the validity of moving to a tile
  checkMove(xVal, yVal) {
    this.xVal = xVal;
    this.yVal = yVal;

      //in the following 4 cases, the player is trying to move offscreen
      //we tell WFC to generate a new seed and to put the player on the opposite end of the axis they tried to walk in
      //this creates an effect like the original legend of zelda when the player enters a new screen
      //anyway, return null so the player doesn't do anything else. WFC will handle the rest
      if (this.xVal < 0) {
        WFCManager.WFC(numOfTilesX - 1, this.y);
        return null;
      }

      else if (this.yVal < 0) {
        WFCManager.WFC(this.x, numOfTilesY - 1);
        return null;
      }

      else if (this.xVal > numOfTilesX - 1) {
        WFCManager.WFC(0, this.y);
        return null;
      }

      else if (this.yVal > numOfTilesY - 1) {
        WFCManager.WFC(this.x, 0);
        return null;
      }

    //if the player wasn't walking offscreen, there must be a tile to check
    //so return it for move() to deal with!
    else {
      return tiles[this.xVal][this.yVal];
    }

  }

  //checks what we can do with the target tile
  //returns true if the tile can be walked on, false if not
  //i deeply apologize for how big the switch statement you're about to read is
  interact(targetTile) {

    //reminder that Tile.possibilities[0] is the string identity of a collapsed tile
    switch (targetTile.possibilities[0]) {

      //if nothing is unique about this tile, you can walk on it and nothing happens
      default:
        return true;

      //similarly boring tiles that the player can never interact with or walk through
      case "Wall":
      case "PyramidWall":
      case "TowerWall":
      case "TowerStairsUp":
      case "BoatWheel":
      case "Table":
      case "Snowman":
      case "TotemComplete":
        return false;

      //pharoah interactions
      case "Sarcophagus":
        //pharoahs love idols and will take all of your idols before trading for ore
        if (this.inventory.getItem("idol") > 0) {
          this.inventory.setItem("idol", parseInt(this.inventory.getItem("idol")) - 1);
          this.inventory.setItem("orb", parseInt(this.inventory.getItem("orb")) + 10);
        }

        //no idols? fiiine, guess i'll take your ore.
        else if (this.inventory.getItem("ore") > 0) {
          this.inventory.setItem("ore", parseInt(this.inventory.getItem("ore")) - 1);
          this.inventory.setItem("orb", parseInt(this.inventory.getItem("orb")) + 1);
        }
        return false;

      //chop down trees
      case "Tree":
        targetTile.collapse("LogGrass");
        return false;

      //pick up picks
      case "Pick":
        targetTile.collapse("Stone");
        this.inventory.setItem("pick", parseInt(this.inventory.getItem("pick")) + 1);
        return true;

      //pick up logs
      case "LogGrass":
        targetTile.collapse("Grass");
        this.inventory.setItem("log", parseInt(this.inventory.getItem("log")) + 1);
        return true;

      //pick up ore
      case "Ore":
        targetTile.collapse("Grass");
        this.inventory.setItem("ore", parseInt(this.inventory.getItem("ore")) + 1);
        return true;

      //pick up orbs
      case "Orb":
        targetTile.collapse("TowerFloor");
        this.inventory.setItem("orb", parseInt(this.inventory.getItem("orb")) + 1);
        return true;

      //mine cave walls if you have a pick
      case "CaveWall":
        if (this.inventory.getItem("pick") > 0) {
          targetTile.collapse("Stone");
          this.inventory.setItem("pick", parseInt(this.inventory.getItem("pick")) - 1);
        }
        return false;
      
      //mine mountains if you have a pick
      case "Mountain":
        if (this.inventory.getItem("pick") > 0) {
          targetTile.collapse("Ore");
          this.inventory.setItem("pick", parseInt(this.inventory.getItem("pick")) - 1);
        }
        return false;
      
      //pick up map
      case "MapWood":
        targetTile.collapse("Wood");
        this.inventory.setItem("map", parseInt(this.inventory.getItem("map")) + 1);
        return true;
      
      //pick up map
      case "MapStone":
        targetTile.collapse("Stone");
        this.inventory.setItem("map", parseInt(this.inventory.getItem("map")) + 1);
        return true;
    
      //put arms on armless snowmen if you have 2 logs to spare
      //considered adding a reward of 1 ore for doing this but it feels more wholesome if it's just intrinsically motivated
      case "SnowmanArmless":
      if (this.inventory.getItem("log") >= 2) {
        targetTile.collapse("Snowman");
        this.inventory.setItem("log", parseInt(this.inventory.getItem("log")) - 2);
        return false;
      }
    
      //place an idol atop a totem for lots of tools!
      case "Totem":
      if (this.inventory.getItem("idol") > 0) {
        targetTile.collapse("TotemComplete");
        this.inventory.setItem("idol", parseInt(this.inventory.getItem("idol")) - 1);
        this.inventory.setItem("pick", parseInt(this.inventory.getItem("pick")) + 5);
        this.inventory.setItem("shovel", parseInt(this.inventory.getItem("shovel")) + 2);
        return false;
      }
    
      //craft shovels if you have logs and ore
      case "Workbench":
      if (this.inventory.getItem("log") >= 3 && this.inventory.getItem("ore") >= 2) {
        this.inventory.setItem("log", parseInt(this.inventory.getItem("log")) - 3);
        this.inventory.setItem("ore", parseInt(this.inventory.getItem("ore")) - 2);
        this.inventory.setItem("shovel", parseInt(this.inventory.getItem("shovel")) + 1);
      }
      return false;
    
      //dig up an idol if you have a shovel, otherwise just walk past
      case "Digsite":
      if (this.inventory.getItem("shovel") > 0) {
        targetTile.collapse("Sand");
        this.inventory.setItem("shovel", parseInt(this.inventory.getItem("shovel")) - 1);
        this.inventory.setItem("idol", parseInt(this.inventory.getItem("idol")) + 1);
        return false;
      }
      return true;
      
    case "Water":
      //place a log on the water (provided you aren't on a boat)
      if (this.inventory.getItem("log") > 0 && layer != -1) {
        targetTile.collapse("LogWater");
        this.inventory.setItem("log", parseInt(this.inventory.getItem("log")) - 1);
        return false;
      }

      //otherwise, no swimming!
      else if (layer != -1) {
        return false;
      }

      //on a boat and walked the plank - leave structure
      structure.closeLayer();
      return false;

      //leave structure
      case "TowerStairsDown":
      case "None":
        structure.closeLayer();
        return false;

      //enter house
      case "House":
        structure = new House(this.x, this.y);
        return false;

      //enter pyramid
      case "Pyramid":
        structure = new Pyramid(this.x, this.y);
        return false;

      //enter cave
      case "Cave":
        structure = new Cave(this.x, this.y);
        return false;

      //enter boat
      case "Boat":
        structure = new Boat(this.x, this.y);
        return false;

      //enter tower
      case "Tower":
        structure = new Tower(this.x, this.y);
        return false;
    }

    //congratulations! you made it to the end of the switch!
  }

  //dictates what happens to tiles the player spawns on
  //this prevents the player from spawning in tiles they shouldn't like trees...
  //...by replacing undesirable tiles with walkable ones like grass and stone
  //it's a bit ugly since it means seeds will slightly change depending on where you entered from,
  //but i can't think of a better solution at the moment :(
  spawnOn(targetTile) {
    switch (targetTile.possibilities[0]) {

      //most tiles will be fine
      default:
        return;

      //grass stuff = grass
      case "Mountain":
      case "Tree":
      case "LogGrass":
      case "House":
      case "Totem":
        targetTile.collapse("Grass");
        return;
      
      //delete pyramids and make little islands for marooned players
      case "Pyramid":
      case "Water":
      case "Boat":
        targetTile.collapse("Sand");
        return;
    
      //medusa cave interiors and exteriors
      case "MapStone":
      case "Pick":
      case "Cave":
        targetTile.collapse("Stone");
        return;

      //snow stuff = snow
      case "Snowman":
      case "SnowmanArmless":
      case "Tower":
        targetTile.collapse("Snow");
        return;

    }
  }

  //teleport with an orb, meaning WFC just cooks up a new seed and pretends it's magic
  //orbs are functionally pretty useless
  //they just look cool and getting them makes a number go up
  //i think that's enough for most people, myself included
  teleport() {
    this.receivedInput();

    if (this.inventory.getItem("orb") > 0) {
      //consume item
      this.inventory.setItem("orb", parseInt(this.inventory.getItem("orb")) - 1);
      //make sure to reset layer in case we teleported from inside a structure
      layer = 0;
      //maintain same player position
      WFCManager.WFC(this.x, this.y);
    }
  }


  //use a map to "uncover" a point of interest nearby
  useMap() {
    this.receivedInput();

    if (this.inventory.getItem("map") > 0) {
      //consume item
      this.inventory.setItem("map", parseInt(this.inventory.getItem("map")) - 1);
  
      //randomly pick a tile
      let targetTile = tiles[this.randomCoords(false)][this.randomCoords(true)];

      //try to spawn something interesting
      targetTile.useMap();
    }
  }

  //called from any function that gets called when the player does something
  //so any input should get rid of the intro screen
  receivedInput() {
    if (showIntroScreen) {
      showIntroScreen = false;
    }
  }

  //returns a random coordinate along the specified axis
  //this is NOT seedRandom() and DOES NOT GENERATE COORDS USING SEED
  randomCoords(isY) {
    let max;

    if (isY) {
      max = numOfTilesY;
    }

    else {
      max = numOfTilesX;
    }

    return Math.floor(Math.random() * max);
  }

}