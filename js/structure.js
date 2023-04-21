//manages all structures -- anything you can enter
//Structure manages some basic stuff but structures are varied and each have their own code for layout in structureLayout()
class Structure {
    
    //child class will tell us where to put the player (x, y) and how big this structure is
    //floorSizeX/Y are abstract values for structures to interpret individually
    constructor(x, y, floorSizeX, floorSizeY) {
        this.x = x;
        this.y = y;
        this.floorSizeX = floorSizeX/2;
        this.floorSizeY = floorSizeY/2;

        this.openLayer(x, y);
    }

    //open a "lower" layer for us.
    //this function is generally overridden by children to set the player's spawn
    //but it will use x, y if spawn point isn't specified
    openLayer(x, y) {
        //this tells WFC not to generate a new seed while we're in this structure
        layer--;
        setupPlayer(x, y);

        //get rid of all that outdoors stuff - focus the player's attention on the structure's interior
        for (let i = 0; i < numOfTilesX; i++) {
            for (let j = 0; j < numOfTilesY; j++) {
              tiles[i][j].collapse("None");
            }
          }

        //and now, build the structure
        this.structureLayout();
    }

    //overridden by children
    structureLayout() {
    }

    //send us back outdoors
    closeLayer() {
        //generate world
        WFCManager.WFC(this.x, this.y);
        //layer is incremented AFTER generating the world so we don't accidentally generate a new seed
        layer++;
        //finally, delete this structure. we don't need it anymore
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

        //center on each axis
        let cX = numOfTilesX/2;
        let cY = numOfTilesY/2;

        //fill a box with walls
        for (let i = cX-this.floorSizeX; i < cX+this.floorSizeY; i++) {

            for (let j = cY-this.floorSizeX; j < cY+this.floorSizeY; j++) {
                tiles[i][j].collapse("Wall");
            }
        }

        //hollow out the walls with wood and other furnishings
        for (let i = cX-this.floorSizeX+1; i < cX+this.floorSizeX-1; i++) {

            for (let j = cY-this.floorSizeY+1; j < cY+this.floorSizeY-1; j++) {
                tiles[i][j].furnishHouse();
            }
        }

        //make a doorway so the player can leave
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

        //center on each axis
        let cX = numOfTilesX/2;
        let cY = numOfTilesY/2;

        //box of walls
        for (let i = cX-this.floorSizeX; i < cX+this.floorSizeX+1; i++) {

            for (let j = cY-this.floorSizeY; j < cY+this.floorSizeY+1; j++) {
                tiles[i][j].collapse("PyramidWall");
            }
        }

        //hollow out box with floor
        for (let i = cX-this.floorSizeX+1; i < cX+this.floorSizeX; i++) {

            for (let j = cY-this.floorSizeY+1; j < cY+this.floorSizeY; j++) {
                tiles[i][j].collapse("PyramidFloor");
            }
        }

        //put torches in the corners
        tiles[cX-this.floorSizeX+1][cY-this.floorSizeY+1].collapse("PyramidTorch");
        tiles[cX-this.floorSizeX+1][cY+this.floorSizeY-1].collapse("PyramidTorch");
        tiles[cX+this.floorSizeX-1][cY-this.floorSizeY+1].collapse("PyramidTorch");
        tiles[cX+this.floorSizeX-1][cY+this.floorSizeY-1].collapse("PyramidTorch");

        //put a sarcophagus (referred to outside of code as a "Pharoah") in the center of the room
        tiles[cX][cY].collapse("Sarcophagus");

        //doorway
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

        //center on each axis
        let cX = numOfTilesX/2;
        let cY = numOfTilesY/2;

        //box of walls
        for (let i = cX-this.floorSizeX; i < cX+this.floorSizeX+1; i++) {

            for (let j = cY-this.floorSizeY; j < cY+this.floorSizeY+1; j++) {
                tiles[i][j].collapse("CaveWall");
            }
        }

        //hollow out floor with some random stalagmites and items scattered around
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

        //center on each axis
        let cX = numOfTilesX/2;
        let cY = numOfTilesY/2;

        //surround the boat with Water instead of None - random but fun feature
        for (let i = 0; i < numOfTilesX; i++) {
            for (let j = 0; j < numOfTilesY; j++) {
              tiles[i][j].collapse("Water");
            }
          }

        //long, skinny box of walls
        for (let i = cX-this.floorSizeX; i < cX+this.floorSizeX+1; i++) {

            for (let j = cY-this.floorSizeY; j < cY+this.floorSizeY+1; j++) {
                tiles[i][j].collapse("Wall");
            }
        }

        //hollow out floor
        for (let i = cX-this.floorSizeX+1; i < cX+this.floorSizeX; i++) {

            for (let j = cY-this.floorSizeY+1; j < cY+this.floorSizeY; j++) {
                tiles[i][j].collapse("Wood");
            }
        }

        //mast
        tiles[cX-2][cY].collapse("Wall");
        //steering wheel
        tiles[cX+1][cY].collapse("BoatWheel");

        //captain's quarters
        tiles[cX+3][cY-1].collapse("Wall");
        tiles[cX+3][cY+1].collapse("Wall");

        //furnish captain's quarters with table and map
        tiles[cX+4][cY-1].collapse("Table");
        tiles[cX+4][cY+1].collapse("MapWood");

        //round off corners
        tiles[cX-this.floorSizeX][cY-this.floorSizeY].collapse("Water");
        tiles[cX-this.floorSizeX][cY+this.floorSizeY].collapse("Water");
        tiles[cX+this.floorSizeX][cY-this.floorSizeY].collapse("Water");
        tiles[cX+this.floorSizeX][cY+this.floorSizeY].collapse("Water");

        //"walk the plank" plank
        //you actually have to walk the plank to leave
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

        //center on each axis
        let cX = numOfTilesX/2;
        let cY = numOfTilesY/2;

        //circular tower. this time we do the interior before the walls
        for (let i = cX-this.floorSizeX; i < cX+this.floorSizeY; i++) {
            for (let j = cY-this.floorSizeX; j < cY+this.floorSizeY; j++) {
                if (Math.sqrt(Math.pow(i - cX, 2) + Math.pow(j - cY, 2)) <= this.floorSizeX-.2) { //the .2 removes some weird edge tiles
                    tiles[i][j].furnishTower();
                }
            }
        }

        //now that interior is done, collapse all tiles bordering Nones to walls
        for (let i = cX-this.floorSizeX; i < cX+this.floorSizeY; i++) {

            for (let j = cY-this.floorSizeX; j < cY+this.floorSizeY; j++) {
                if (tiles[i][j].possibilities[0] !== "None" && tiles[i][j].countAdjacent("None") !== 0) {
                    tiles[i][j].collapse("TowerWall");
                }
            }
        }

        //stairs so it's more tower-y
        //pretend TowerStairsUp is a window for now. i'm too lazy to add multiple floors
        tiles[cX][cY-this.floorSizeY+1].collapse("TowerStairsUp");
        tiles[cX][cY+this.floorSizeY-1].collapse("TowerStairsDown");

        //hole in the middle of the tower inspired by old school Zelda dungeons
        tiles[cX][cY].collapse("None");
    }
}