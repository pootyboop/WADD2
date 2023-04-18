class Player {

  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.inventory = new Inv();

    this.img = loadImage('images/Player.png');
  }

  draw() {
    if (WFCManager.isGenerating)
    return;

    drawOnGrid(this.img, this.x, this.y);
  }

  move(direction) {
    if (showIntroScreen) {
      showIntroScreen = false;
    }

    let targetTile;
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

    if (targetTile != null) {
      let shouldMove = this.interact(targetTile);

      if (shouldMove) {
        this.x = targetTile.x;
        this.y = targetTile.y;
        //console.log(" Moved to (" + this.x + ", " + this.y + ")");
      }
    }
  }

  checkMove(xVal, yVal) {
    this.xVal = xVal;
    this.yVal = yVal;

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

    else {
      return tiles[this.xVal][this.yVal];
    }

  }

  //i deeply apologize for how big this switch is
  interact(targetTile) {
    switch (targetTile.possibilities[0]) {

      default:
        return true;

      case "Sarcophagus":
        if (this.inventory.getItem("idol") > 0) {
          this.inventory.setItem("idol", parseInt(this.inventory.getItem("idol")) - 1);
          this.inventory.setItem("orb", parseInt(this.inventory.getItem("orb")) + 10);
        }

        else if (this.inventory.getItem("ore") > 0) {
          this.inventory.setItem("ore", parseInt(this.inventory.getItem("ore")) - 1);
          this.inventory.setItem("orb", parseInt(this.inventory.getItem("orb")) + 1);
        }
        return false;

      case "Wall":
      case "PyramidWall":
      case "TowerWall":
      case "TowerStairsUp":
      case "BoatWheel":
      case "Table":
      case "Snowman":
      case "TotemComplete":
        return false;

      case "Tree":
        targetTile.collapse("LogGrass");
        return false;

      case "Pick":
        targetTile.collapse("Stone");
        this.inventory.setItem("pick", parseInt(this.inventory.getItem("pick")) + 1);
        return true;

      case "LogGrass":
        targetTile.collapse("Grass");
        this.inventory.setItem("log", parseInt(this.inventory.getItem("log")) + 1);
        return true;

      case "Ore":
        targetTile.collapse("Grass");
        this.inventory.setItem("ore", parseInt(this.inventory.getItem("ore")) + 1);
        return true;

      case "Orb":
        targetTile.collapse("TowerFloor");
        this.inventory.setItem("orb", parseInt(this.inventory.getItem("orb")) + 1);
        return true;

      case "CaveWall":
        if (this.inventory.getItem("pick") > 0) {
          targetTile.collapse("Stone");
          this.inventory.setItem("pick", parseInt(this.inventory.getItem("pick")) - 1);
        }
        return false;
      
      case "Mountain":
        if (this.inventory.getItem("pick") > 0) {
          targetTile.collapse("Ore");
          this.inventory.setItem("pick", parseInt(this.inventory.getItem("pick")) - 1);
        }
        return false;
    
      case "SnowmanArmless":
      if (this.inventory.getItem("log") >= 2) {
        targetTile.collapse("Snowman");
        this.inventory.setItem("log", parseInt(this.inventory.getItem("log")) - 2);
        return false;
      }
    
      case "Totem":
      if (this.inventory.getItem("idol") > 0) {
        targetTile.collapse("TotemComplete");
        this.inventory.setItem("idol", parseInt(this.inventory.getItem("idol")) - 1);
        this.inventory.setItem("pick", parseInt(this.inventory.getItem("pick")) + 5);
        this.inventory.setItem("shovel", parseInt(this.inventory.getItem("shovel")) + 2);
        return false;
      }
    
      case "Workbench":
      if (this.inventory.getItem("log") >= 3 && this.inventory.getItem("ore") >= 2) {
        this.inventory.setItem("log", parseInt(this.inventory.getItem("log")) - 3);
        this.inventory.setItem("ore", parseInt(this.inventory.getItem("ore")) - 2);
        this.inventory.setItem("shovel", parseInt(this.inventory.getItem("shovel")) + 1);
      }
      return false;
    
      case "Digsite":
      if (this.inventory.getItem("shovel") > 0) {
        targetTile.collapse("Sand");
        this.inventory.setItem("shovel", parseInt(this.inventory.getItem("shovel")) - 1);
        this.inventory.setItem("idol", parseInt(this.inventory.getItem("idol")) + 1);
        return false;
      }
      return true;
      
        //========KEEP THESE TOGETHER===========
      case "Water":
        if (this.inventory.getItem("log") > 0 && layer != -1) {
          targetTile.collapse("LogWater");
          this.inventory.setItem("log", parseInt(this.inventory.getItem("log")) - 1);
          return false;
        }

        else if (layer != -1) {
          return false;
        }

      case "TowerStairsDown":
      case "None":
        structure.closeLayer();
        return false;
        //========ENDS HERE========

      case "House":
        structure = new House(this.x, this.y);
        return false;

      case "Pyramid":
        structure = new Pyramid(this.x, this.y);
        return false;

      case "Cave":
        structure = new Cave(this.x, this.y);
        return false;

      case "Boat":
        structure = new Boat(this.x, this.y);
        return false;

      case "Tower":
        structure = new Tower(this.x, this.y);
        return false;
  }
  }

  spawnOn(targetTile) {
    switch (targetTile.possibilities[0]) {

      default:
        return;

      case "Mountain":
      case "Tree":
      case "LogGrass":
      case "House":
      case "Totem":
        targetTile.collapse("Grass");
        return;
      
      case "Pyramid":
      case "Water":
      case "Boat":
        targetTile.collapse("Sand");
        return;
    
      case "Cave":
        targetTile.collapse("Stone");
        return;

      case "Snowman":
      case "SnowmanArmless":
      case "Tower":
        targetTile.collapse("Snow");
        return;

    }
  }

  teleport() {
    if (this.inventory.getItem("orb") > 0) {
      this.inventory.setItem("orb", parseInt(this.inventory.getItem("orb")) - 1);
      layer = 0;
      WFCManager.WFC(this.x, this.y);
    }
  }

}