class Structure {
    constructor(x, y, floorSize) {
        this.x = x;
        this.y = y;
        this.floorSize = floorSize;

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
        super(x, y, 3);
    }

    openLayer() {
        super.openLayer(Math.floor(numOfTilesX/2), Math.floor(numOfTilesY/2+this.floorSize/2+1));
    }

    structureLayout() {
        super.structureLayout();

        let cX = numOfTilesX/2;
        let cY = numOfTilesY/2;

        for (let i = cX-this.floorSize; i < cX+this.floorSize; i++) {

            for (let j = cY-this.floorSize; j < cY+this.floorSize; j++) {
                tiles[i][j].collapse("Wall");
            }
        }

        for (let i = cX-this.floorSize+1; i < cX+this.floorSize-1; i++) {

            for (let j = cY-this.floorSize+1; j < cY+this.floorSize-1; j++) {
                tiles[i][j].collapse("Wood");
                tiles[i][j].furnish();
            }
        }

        tiles[cX][cY+this.floorSize-1].collapse("Wood");
    }
}