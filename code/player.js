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

  interact(targetTile) {
    switch (targetTile.possibilities[0]) {

      case "Sarcophagus":
      case "Mountain":
      case "Wall":
      case "PyramidWall":
      case "BoatWheel":
      case "Table":
        return false;

      case "Tree":
        targetTile.collapse("Log");
        return false;

      case "Log":
        targetTile.collapse("Grass");
        this.inventory.logs++;
        return true;
      
      case "Water":
        if (this.inventory.logs > 0 && layer != -1) {
          targetTile.collapse("LogWater");
          this.inventory.logs--;
          return false;
        }

        else if (layer != -1) {
          return false;
        }
        
      case "None":
        structure.closeLayer();
        return false;

      default:
        return true;

      case "House":
        structure = new House(this.x, this.y);
        return false;

        case "Pyramid":
          structure = new Pyramid(this.x, this.y);
          return false;

        case "Boat":
          structure = new Boat(this.x, this.y);
          return false;
    }
  }

}