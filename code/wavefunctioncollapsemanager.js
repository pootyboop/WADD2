class WaveFunctionCollapseManager {
    constructor() {
        this.isGenerating = false;

        this.WFC(numOfTilesX/2, numOfTilesY/2)
    }

    WFC(x, y) {
        this.isGenerating = true;

        this.loadingScreen();

        this.initTiles();
        this.newSeed();
        //console.log("NEW SEED UPDATE", seedOffset);

        this.collapseInitial(numOfTilesX/2, numOfTilesY/2);
        //console.log("COLLAPSE INITIAL UPDATE", seedOffset);
        this.collapseAllTiles();
        //console.log("COLLAPSE ALL UPDATE", seedOffset);

        this.cleanupTerrain();

        setupPlayer(x, y);

        this.isGenerating = false;

        //console.log("Final Seed Position", seedOffset);

        //console.log("Done generating!");
    }

    cleanupTerrain() {
      this.firstPass();
      //console.log("PASS 1 UPDATE", seedOffset);
      this.secondPass();
      //console.log("PASS 2 UPDATE", seedOffset);
      this.removeIsolated();
      //console.log("REMOVE ISOLATED UPDATE", seedOffset);
    }

    loadingScreen() {
      background(20);
      textSize(100);
      fill(100);
      text("LoaDiNg...", width*.5,height*.5);
    }

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

    newSeed() {
        seedOffset = 3;
        if (layer == 0) {
            seed = Math.floor(Math.random() * 99999999);
        }
        //console.log("Seed", seed);
    }

    collapseInitial(x, y) {
      tiles[x][y].collapsePossibilities();
    }

    collapseAllTiles() {
        while (true) {
          let currentTile = this.getCollapsableTile();
          
          if (currentTile != null) {
            currentTile.collapsePossibilities();
          }
          
          else {
            return;
          }
        }
    }

    getCollapsableTile() {
      let collapsableTile = null;
      let numOfPossibilities = 1000;
      
      for (let i = 0; i < numOfTilesX; i++) {
        for (let j = 0; j < numOfTilesY; j++) {
          let currentTile = tiles[i][j];
          if (currentTile.possibilities.length !== 0 && currentTile.possibilities.length < numOfPossibilities && !currentTile.collapsed) {
            collapsableTile = currentTile;
            numOfPossibilities = collapsableTile.possibilities.length;
          }
        }
      }
      
      return collapsableTile;
    }

    firstPass() {
      for (let i = 0; i < numOfTilesX; i++) {
        for (let j = 0; j < numOfTilesY; j++) {
          tiles[i][j].firstPass();
        }
      }
    }
      
    secondPass() {
      for (let i = 0; i < numOfTilesX; i++) {
        for (let j = 0; j < numOfTilesY; j++) {
          tiles[i][j].secondPass();
        }
      }
    }
      
    removeIsolated() {
      for (let i = 0; i < numOfTilesX; i++) {
        for (let j = 0; j < numOfTilesY; j++) {
          tiles[i][j].removeIsolated();
        }
      }
    }


}