class Structure {
    
    //"no overloading allowed!!!" -js
    /*
    constructor(x, y, floorSize) {
        this.x = x;
        this.y = y;
        this.floorSizeX = floorSize/2;
        this.floorSizeY = floorSize/2;

        this.openLayer(x, y);
    }
    */
    
    constructor(x, y, floorSizeX, floorSizeY) {
        this.x = x;
        this.y = y;
        this.floorSizeX = floorSizeX/2;
        this.floorSizeY = floorSizeY/2;

        this.openLayer(x, y);
    }

    openLayer(x, y) {
        //WFCManager.initTiles();
        layer--;
        setupPlayer(x, y);

        for (let i = 0; i < numOfTilesX; i++) {
            for (let j = 0; j < numOfTilesY; j++) {
              tiles[i][j].collapse("None");
            }
          }

        this.structureLayout();
    }

    //overridden by children
    structureLayout() {
    }

    closeLayer() {
        WFCManager.WFC(this.x, this.y);
        layer++;
        structure = null;
    }
}



class House extends Structure {
    constructor(x, y) {
        super(x, y, 6, 6);
    }

    openLayer() {
        super.openLayer(Math.floor(numOfTilesX/2), Math.floor(numOfTilesY/2+this.floorSizeY/2+1));
    }

    structureLayout() {
        super.structureLayout();

        let cX = numOfTilesX/2;
        let cY = numOfTilesY/2;

        for (let i = cX-this.floorSizeX; i < cX+this.floorSizeY; i++) {

            for (let j = cY-this.floorSizeX; j < cY+this.floorSizeY; j++) {
                tiles[i][j].collapse("Wall");
            }
        }

        for (let i = cX-this.floorSizeX+1; i < cX+this.floorSizeX-1; i++) {

            for (let j = cY-this.floorSizeY+1; j < cY+this.floorSizeY-1; j++) {
                tiles[i][j].collapse("Wood");
                tiles[i][j].furnishHouse();
            }
        }

        tiles[cX][cY+this.floorSizeY-1].collapse("Wood");
    }
}



class Pyramid extends Structure {
    constructor(x, y) {
        super(x, y, 8, 8);
    }

    openLayer() {
        super.openLayer(Math.floor(numOfTilesX/2), Math.floor(numOfTilesY/2+this.floorSizeY/2));
    }

    structureLayout() {
        super.structureLayout();

        let cX = numOfTilesX/2;
        let cY = numOfTilesY/2;

        for (let i = cX-this.floorSizeX; i < cX+this.floorSizeX+1; i++) {

            for (let j = cY-this.floorSizeY; j < cY+this.floorSizeY+1; j++) {
                tiles[i][j].collapse("PyramidWall");
            }
        }

        for (let i = cX-this.floorSizeX+1; i < cX+this.floorSizeX; i++) {

            for (let j = cY-this.floorSizeY+1; j < cY+this.floorSizeY; j++) {
                tiles[i][j].collapse("PyramidFloor");
            }
        }

        tiles[cX-this.floorSizeX+1][cY-this.floorSizeY+1].collapse("PyramidTorch");
        tiles[cX-this.floorSizeX+1][cY+this.floorSizeY-1].collapse("PyramidTorch");
        tiles[cX+this.floorSizeX-1][cY-this.floorSizeY+1].collapse("PyramidTorch");
        tiles[cX+this.floorSizeX-1][cY+this.floorSizeY-1].collapse("PyramidTorch");

        tiles[cX][cY].collapse("Sarcophagus");

        tiles[cX][cY+this.floorSizeY].collapse("PyramidFloor");
    }
}



class Cave extends Structure {
    constructor(x, y) {
        super(x, y, 8, 6);
    }

    openLayer() {
        super.openLayer(Math.floor(numOfTilesX/2), Math.floor(numOfTilesY/2+this.floorSizeY/2));
    }

    structureLayout() {
        super.structureLayout();

        let cX = numOfTilesX/2;
        let cY = numOfTilesY/2;

        for (let i = cX-this.floorSizeX; i < cX+this.floorSizeX+1; i++) {

            for (let j = cY-this.floorSizeY; j < cY+this.floorSizeY+1; j++) {
                tiles[i][j].collapse("CaveWall");
            }
        }

        for (let i = cX-this.floorSizeX+1; i < cX+this.floorSizeX; i++) {

            for (let j = cY-this.floorSizeY+1; j < cY+this.floorSizeY; j++) {
                tiles[i][j].furnishCave();
            }
        }

        tiles[cX][cY+this.floorSizeY].collapse("Stone");
    }
}



class Boat extends Structure {
    constructor(x, y) {
        super(x, y, 10, 4);
    }

    openLayer() {
        super.openLayer(Math.floor(numOfTilesX/2), Math.floor(numOfTilesY/2+this.floorSizeY/2));
    }

    structureLayout() {
        super.structureLayout();

        let cX = numOfTilesX/2;
        let cY = numOfTilesY/2;

        for (let i = 0; i < numOfTilesX; i++) {
            for (let j = 0; j < numOfTilesY; j++) {
              tiles[i][j].collapse("Water");
            }
          }

        for (let i = cX-this.floorSizeX; i < cX+this.floorSizeX+1; i++) {

            for (let j = cY-this.floorSizeY; j < cY+this.floorSizeY+1; j++) {
                tiles[i][j].collapse("Wall");
            }
        }

        for (let i = cX-this.floorSizeX+1; i < cX+this.floorSizeX; i++) {

            for (let j = cY-this.floorSizeY+1; j < cY+this.floorSizeY; j++) {
                tiles[i][j].collapse("Wood");
            }
        }

        tiles[cX-2][cY].collapse("Wall");
        tiles[cX+1][cY].collapse("BoatWheel");
        tiles[cX+4][cY-1].collapse("Table");

        tiles[cX+3][cY-1].collapse("Wall");
        tiles[cX+3][cY+1].collapse("Wall");

        tiles[cX-this.floorSizeX][cY-this.floorSizeY].collapse("Water");
        tiles[cX-this.floorSizeX][cY+this.floorSizeY].collapse("Water");
        tiles[cX+this.floorSizeX][cY-this.floorSizeY].collapse("Water");
        tiles[cX+this.floorSizeX][cY+this.floorSizeY].collapse("Water");

        //plank
        for (let i = cY+this.floorSizeY; i < cY+this.floorSizeY+3; i++) {
            tiles[cX][i].collapse("Wood");
        }
    }
}



class Tower extends Structure {
    constructor(x, y) {
        super(x, y, 10, 10);
    }

    openLayer() {
        super.openLayer(Math.floor(numOfTilesX/2), Math.floor(numOfTilesY/2+this.floorSizeY/2+1));
    }

    structureLayout() {
        super.structureLayout();

        let cX = numOfTilesX/2;
        let cY = numOfTilesY/2;

        for (let i = cX-this.floorSizeX; i < cX+this.floorSizeY; i++) {

            for (let j = cY-this.floorSizeX; j < cY+this.floorSizeY; j++) {
                if (Math.sqrt(Math.pow(i - cX, 2) + Math.pow(j - cY, 2)) <= this.floorSizeX-.2) { //the .2 removes some weird edge tiles
                    tiles[i][j].furnishTower();
                }
            }
        }

        for (let i = cX-this.floorSizeX; i < cX+this.floorSizeY; i++) {

            for (let j = cY-this.floorSizeX; j < cY+this.floorSizeY; j++) {
                if (tiles[i][j].possibilities[0] !== "None" && tiles[i][j].countAdjacent("None") !== 0) {
                    tiles[i][j].collapse("TowerWall");
                }
            }
        }

        tiles[cX][cY-this.floorSizeY+1].collapse("TowerStairsUp");
        tiles[cX][cY+this.floorSizeY-1].collapse("TowerStairsDown");

        tiles[cX][cY].collapse("None");

        /*
        for (let i = cX-this.floorSizeX+1; i < cX+this.floorSizeX-1; i++) {

            for (let j = cY-this.floorSizeY+1; j < cY+this.floorSizeY-1; j++) {
                tiles[i][j].collapse("TowerFloor");
                tiles[i][j].furnishHouse();
            }
        }
        */
    }
}