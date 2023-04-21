//an individual Tile on the grid
//tiles[][] is made up of these
//this class is closely linked with WaveFunctionCollapseManager and Player
class Tile {
  constructor(x, y) {

    //array location, NOT physical location!!!!!
    this.x = x;
    this.y = y;

    //image to display
    this.img;

    //adjacent tiles in cardinal directions
    this.adjacent = [];
    //adjacent tiles in diagonal directions
    this.corners = [];

    //possibilities of what this tile can be
    //when collapsed, Tiles remove everything except for the selected possibility from this array
    //this means that collapsed Tiles are defined by possibilities[0]
    //this also means that if a Tile is somehow not completely collapsed, it will be treated as its first possibility
    //however, it will not be correctly displayed since img must be set first (which is only done when collapse() is called)
    this.possibilities = [];

    this.possibilities.push("Grass");
    this.possibilities.push("Water");
    this.possibilities.push("Sand");
    this.possibilities.push("Tree");
    this.possibilities.push("Mountain");
    this.possibilities.push("Stone");
    this.possibilities.push("Boat");

    //possibilities that are a little rarer
    if (seed % 2 === 1) {
      this.possibilities.push("House");
    }
    if (seed % 4 === 1) {
      this.possibilities.push("Pyramid");
    }
    //the (seed + 1) here means caves and pyramids will never spawn in the same seed for WFC-related reasons
    //but they may be added later in quality control functions
    if ((seed + 1) % 4  === 1) {
      this.possibilities.push("Cave");
    }

    //if this tile has been collapsed
    this.collapsed = false;
  }

  draw() {
    drawOnGrid(this.img, this.x, this.y);
  }

  //just grabs our image. images are named "TILENAME.png"
  getImage() {
    return loadImage('../images/tiles/' + this.possibilities[0] + '.png');
  }

  //initialises references to neighbouring tiles in cardinal directions
  //if statements ensure we don't push a spot that isn't on the grid
  setAdjacent() {
    //north
    if (this.x > 0) {
      this.adjacent.push(tiles[this.x - 1][this.y]);
    }

    //west
    if (this.y > 0) {
      this.adjacent.push(tiles[this.x][this.y - 1]);
    }

    //south
    if (this.x < numOfTilesX - 1) {
      this.adjacent.push(tiles[this.x + 1][this.y]);
    }

    //east
    if (this.y < numOfTilesY - 1) {
      this.adjacent.push(tiles[this.x][this.y + 1]);
    }
  }

  //initialises references to neighbouring tiles in diagonal directions
  //if statements ensure we don't push a spot that isn't on the grid
  setCorners() {
    //northwest
    if (this.x > 0 && this.y > 0) {
      this.corners.push(tiles[this.x - 1][this.y - 1]);
    }

    //southwest
    if (this.x < numOfTilesX - 1 && this.y > 0) {
      this.corners.push(tiles[this.x + 1][this.y - 1]);
    }

    //southeast
    if (this.x < numOfTilesX - 1 && this.y < numOfTilesY - 1) {
      this.corners.push(tiles[this.x + 1][this.y + 1]);
    }

    //northeast
    if (this.x > 0 && this.y < numOfTilesY - 1) {
      this.corners.push(tiles[this.x - 1][this.y + 1]);
    }
  }

  //collapse a tile to one of its possibilities and update neighbours
  //DO NOT USE THIS AFTER WAVE FUNCTION COLLAPSE -- USE collapse()
  collapsePossibilities() {
    const finalPossibility = this.getBestCollapsePossibility();
    this.collapse(finalPossibility);
  
    //update nearby Tiles' possibilities
    this.updateAdjacent();
    this.updateCorners();
  }
  
  //DIRECTLY collapse a tile to a specified ID.
  //this will set the tile no matter what and will not update neighbours' possibilities
  //DO NOT USE THIS IN INITIAL WAVE FUNCTION COLLAPSE -- USE collapsePossibilities()
  collapse(ID) {
    this.collapsed = true;

    //directly set possibilities to the specified ID -- no questions asked
    this.possibilities = [];
    this.possibilities.push(ID);

    //update img
    this.img = this.getImage();
  }
  
  //finds the best possibility for this tile to collapse to
  //this always returns SOMETHING, but it may not be something nice
  getBestCollapsePossibility() {
    const rand = this.seedRandom();
    const sortedPossibilities = this.sortPossibilities(this.possibilities);
  
    //iterates through the weight-sorted array
    //check out sortPossibilities() and getWeight() for more on this
    for (let i = 0; i < sortedPossibilities.length; i++) {
      if (this.getWeight(sortedPossibilities[i]) > rand) {
        //best case scenario! we found a weighted possibility with a weight less than our random alpha value
        //this possibility is definitely what it should be. yay!
        return sortedPossibilities[i];
      }
    }
  
    if (sortedPossibilities.length === 0) {
      if (possibilities.length === 0) {
        //worst case scenario. there are NO POSSIBILITIES. WHAT?!?!?!?!
        //create a gross black square that should be immediately visible
        return "None";
      }

      //pretty bad scenario. there are no sorted possibilities for whatever reason
      //so we return the first possibility we can find, no sorting to be had. disgusting!
      return possibilities[0];
    }

    //non-ideal scenario. possibilities are sorted, but nothing was less than our random number.
    //so we just take the first item in the array, whatever it is
    return sortedPossibilities[0];
  }
  
  //let Tiles in adjacent[] know what this Tile has collapsed to and remove invalid possibilities accordingly
  updateAdjacent() {
    for (let i = 0; i < this.adjacent.length; i++) {
      this.adjacent[i].removePossibilities(this.getInvalidAdjacentPossibilities(this.possibilities[0]));
    }
  }
  
  //let Tiles in corners[] know what this Tile has collapsed to and remove invalid possibilities accordingly
  updateCorners() {
    for (let i = 0; i < this.corners.length; i++) {
      this.corners[i].removePossibilities(this.getInvalidAdjacentPossibilities(this.possibilities[0]));
    }
  }
  
  //remove an array of possibilities from this Tile's possibilities[]
  removePossibilities(removePossibilities) {
    for (let i = 0; i < removePossibilities.length; i++) {
      this.possibilities = this.possibilities.filter((possibility) => possibility !== removePossibilities[i]);
    }
  }
  
  //the first quality pass
  //put quality pass stuff here unless it needs to happen AFTER changes made in firstPass()
  //this should be called AFTER WFC has completed and BEFORE secondPass()
  firstPass() {
    //do biome stuff here before all the Tile-by-Tile cases are dealt with
    this.biomeModifiers();
  
    switch (this.possibilities[0]) {
      case "Sand":
        this.cleanOceanSand();
        break;
      case "Stone":
        this.pool();
        break;
      case "Water":
        this.drySmallPonds();
        break;
      case "Pyramid":
        this.isolatePyramids();
        break;
      case "Cave":
        this.isolateCaves();
        break;
      case "Grass":
      case "Tree":
        this.spawnTotems();
        break;
      case "Tree":
        this.fellTrees();
    }
  }
  
  //the second quality pass
  //ONLY put quality pass stuff here if it needs to happen AFTER changes made in firstPass()
  //this should be called AFTER WFC and firstPass() have completed
  secondPass() {
    switch (this.possibilities[0]) {
      case "Sand":
        this.createDigsite();
        this.growGrass();
        break;
      case "Stone":
        this.breakIntoSand();
        break;
        /*
     case "Grass":
        this.collapse("House");
        */
    }
  }
  
  //replace Tiles en masse to create a new biome
  //this is done after WFC to keep WFC light
  //putting too many possibilities in WFC would not be great for performance, so it's generally only used for basic terrain generation
  biomeModifiers() {
    //lake
    if (seed % 5 == 1) {
      switch (this.possibilities[0]) {
        case "Sand":
        case "Pyramid":
        case "Grass":
          this.collapse("Water");
          break;
        case "Stone":
        case "Cave":
          this.collapse("Sand");
          break;
        case "Mountain":
        case "Tree":
          if (this.seedRandom() < 0.7)
            this.collapse("Grass");
          break;
        case "Water":
          //boats hold a valuable map, so don't spam them all over oceans
          if (this.seedRandom() < 0.001)
            this.collapse("Boat");
          break;
      }
    }
  
    //mountain city
    if (seed % 45 == 1) {
      switch (this.possibilities[0]) {
        case "Tree":
        case "Pyramid":
          //LOTS of houses - trees are very common
          this.collapse("House");
          break;
        case "Water":
        case "Sand":
          if (this.seedRandom() < 0.7)
            //mountains are thicker here than in mountain ranges, so players will need picks to get through
            //it's a rare biome with a ridiculous amount of structures so it should be challenging
            this.collapse("Mountain");
          else
            this.collapse("Grass");
          break;
      }
    }
  
    //mountain range
    if (seed % 14 == 1) {
      switch (this.possibilities[0]) {
        case "Tree":
          //LOTS of mountains - trees are very common
          this.collapse("Mountain");
          break;
      }
    }
  
    //desert
    if (seed % 10 == 1) {
      switch (this.possibilities[0]) {
        case "Tree":
        case "Grass":
        case "Mountain":
          this.collapse("Sand");
          break;
        case "House":
          //pyramids will be just as common as houses in these biomes
          //the rarity here comes from actually finding a desert biome that would have had a house in it
          this.collapse("Pyramid");
          break;
        case "Water":
          //water dries up
          this.collapse("Stone");
          break;
      }
    }
  
    //frozen
    if ((seed + 2/*+2 prevents any possible overlap with other biomes*/) % 5 == 1) {
      switch (this.possibilities[0]) {
        case "Tree":
          if ((seed + 2) % 10 == 1) {
            let seedRandom = this.seedRandom();

            //less snowmen than there would be trees because nobody's making that many snowmen
            if (seedRandom < .3) {
              this.collapse("Snowman");
            }

            //the interactive snowmen are a little rarer - this makes them more special and personal to find
            else if (seedRandom < .5) {
              this.collapse("SnowmanArmless");
            }
            
            else {
              this.collapse("Snow");
            }
            break;
          }
        case "Grass":
        case "Mountain":
        case "Sand":
          this.collapse("Snow");
          break;

        //like with pyramids in deserts, the rarity comes from finding a frozen biome with a would-be house/pyramid
        case "House":
        case "Pyramid":
          this.collapse("Tower");
          break;
        
        //water freezes... and boats too. maybe i'll add a frozen shipwreck
        case "Water":
        case "Boat":
          this.collapse("Ice");
          break;
      }
    }
  }

  //turn a few trees in forested areas into pre-felled logs
  fellTrees() {
    if (this.seedRandom() < .3 && this.countAdjacent("Tree") <= 2 && this.countAllNear("Log") <= 0) {
      this.collapse("LogGrass");
    }
  }

  //create dig sites in clear, sandy areas roughly 2.5% the time
  createDigsite() {
    if (this.seedRandom() < .05 && seed % 2 === 1 && this.countAllNear("Sand") >= 4 && this.countAllNear("Digsite") === 0) {
      this.collapse("Digsite");
    }
  }

  //sand surrounded by grass turns into grass
  growGrass() {
    if (this.countAdjacent("Grass") >= 5 && this.countAllNear("Water") <= 0) {
      this.collapse("Grass");
    }
  }
  
  //tiny sandbar islands sink because i think they're ugly
  cleanOceanSand() {
    if (this.countAllNear("Water") >= 3) {
      this.collapse("Water");
    }
  }
  
  //single-tile ponds turn to grass
  //this can cause trouble in non-grassy areas. keep an eye out!
  drySmallPonds() {
    if (this.countAllNear("Water") === 0) {
      this.collapse("Grass");
    }
  }

  //adds totems on grass. very rare
  spawnTotems() {
    if (this.seedRandom() < .002 && seed % 6 === 1) {
      this.collapse("Totem");
    }
  }
  
  //stone granulates. is that gramatically correct? it breaks into tiny little bits. i think you get what i mean
  breakIntoSand() {
    if (this.countAllNear("Sand") >= 1 && this.countAllNear("Grass") >= 3) {
      this.collapse("Sand");
    }
  }
  
  //water erosion creates small pools in stone
  //sort of reverses drySmallPonds(), but only in stone-y areas
  pool() {
    if (this.countAllNear("Stone") >= 3) {
      this.collapse("Water");
    }
  }
  
  //make sure pyramids don't bunch up since they should feel singular and rare
  isolatePyramids() {
    if (this.countAllNear("Pyramid") >= 1) {
      this.collapse("Sand");
    }
  }
  
  //make sure caves don't bunch up
  //they still do anyway. not sure if this function actually does anything. whatever
  isolateCaves() {
    if (this.countAllNear("Cave") >= 1) {
      this.collapse("Stone");
    }
  }

  //randomly decorate house interiors with tables, stools, workbenches, and maps
  furnishHouse() {
    if (this.seedRandom() < .2 && this.countAllNear("Wall") >= 3) {
      this.collapse("Table");
    }
    else if (this.seedRandom() < .2 && this.countAllNear("Table") >= 1) {
      this.collapse("Stool");
    }

    //rare! look for a boat if you want a guaranteed one
    else if (this.seedRandom() < .01) {
      this.collapse("MapWood");
    }

    else if (this.seedRandom() < .1) {
      this.collapse("Workbench");
    }

    else {
      this.collapse("Wood");
    }
  }

  //randomise cave interiors a bit with stalagmites, picks, and maps
  furnishCave() {
    let seedRandom = this.seedRandom()

    //rare! look for a boat if you want a guaranteed one
    if (seedRandom < .01) {
      this.collapse("MapStone");
    }

    else if (seedRandom < .1) {
      this.collapse("CaveWall");
    }
    
    else if (seedRandom < .2) {
      this.collapse("Pick");
    }

    else {
        this.collapse("Stone");
    }
  }

  //scatter orbs around tower floors
  //very wide range of how many you can find, so you might hit the jackpot sometimes :)
  furnishTower() {
    if (this.seedRandom() < .1 && this.countAllNear("Wall") === 0) {
      this.collapse("Orb");
    }

    else {
      this.collapse("TowerFloor");
    }
  }
  
  //count all cardinally adjacent tiles of a type
  //technically safe to use during WFC but NOT RECOMMENDED as it checks all of possibilities[], which should not be relied on during terrain generation
  //guaranteed safe to use post-WFC during quality passes
  countAdjacent(possibility) {
    let ct = 0;
  
    for (let i = 0; i < this.adjacent.length; i++) {
      if (this.adjacent[i].possibilities.includes(possibility)) {
        ct++;
      }
    }
  
    return ct;
  }
  
  //count all diagonally adjacent tiles of a type
  //technically safe to use during WFC but NOT RECOMMENDED as it checks all of possibilities[], which should not be relied on during terrain generation
  //guaranteed safe to use post-WFC during quality passes
  countCorners(possibility) {
    let ct = 0;
  
    for (let i = 0; i < this.corners.length; i++) {
      if (this.corners[i].possibilities.includes(possibility)) {
        ct++;
      }
    }
  
    return ct;
  }
  
  //count all cardinally and diagonally adjacent tiles of a type
  //technically safe to use during WFC but NOT RECOMMENDED as it checks all of possibilities[], which should not be relied on during terrain generation
  //guaranteed safe to use post-WFC during quality passes
  countAllNear(possibility) {
    return this.countAdjacent(possibility) + this.countCorners(possibility);
  }
  
  //sometimes turns lonely tiles into their neighbour so they don't stick out and look weird
  //does not modify cool stuff like structures
  removeIsolated() {
    if (this.seedRandom() < 0.4 &&

    //full list of ignored tiles that will remain lonely:
    this.possibilities[0] != "Mountain" &&
    this.possibilities[0] != "Tree" &&
    this.possibilities[0] != "Pyramid" &&
    this.possibilities[0] != "Boat" &&
    this.possibilities[0] != "Cave" &&
    this.possibilities[0] != "House" &&
    this.possibilities[0] != "Tower" &&
    this.possibilities[0] != "Digsite" &&
    this.possibilities[0] != "Totem"
    //list ends here

    ) {
      //all = cardinally and diagonally adjacent tiles
      let all = this.adjacent.concat(this.corners);
      for (let i = 0; i < all.length; i++) {
        if (all[i].possibilities.includes(this.possibilities[0])) {
          return;
        }
      }
  
      //turn this tile into an arbitrary neighbour
      this.collapse(all[0].possibilities[0]);
    }
  }

  //returns a pseudorandom alpha value based on seed and seedOffset
  //seedOffset (and therefore seedRandom()'s return) will change everytime the function is called,
  //so save the return as a variable if it's being used for a switch or if else 
  seedRandom() {
    //set seedOffset to something random looking. values here are arbitrary
    seedOffset = ((seedOffset * seedOffset) % 13131) * 3;
  
    //set return to a value between 0 and 1. also take seed into account!
    let seedRandom = (seed + seedOffset) % 100.0 / 100.0;
    return seedRandom;
  }

  //return an array of possibilities that are incompatible with the input collapse possibility
  getInvalidAdjacentPossibilities(possibility) {
    let invalids = [];
    
    switch (possibility) {
      case "Water":
        invalids.push("Grass");
        invalids.push("Mountain");
        invalids.push("Tree");
        invalids.push("House");
        invalids.push("Pyramid");
        invalids.push("Cave");
        break;
      case "Sand":
        invalids.push("Mountain");
        invalids.push("Tree");
        invalids.push("Stone");
        invalids.push("House");
        invalids.push("Boat");
        invalids.push("Cave");
        break;
      case "Grass":
        invalids.push("Water");
        invalids.push("Pyramid");
        invalids.push("Boat");
        invalids.push("Cave");
        break;
      case "Stone":
        invalids.push("Tree");
        invalids.push("Mountain");
        invalids.push("Sand");
        invalids.push("House");
        invalids.push("Pyramid");
        invalids.push("Boat");
        break;
      case "Mountain":
        invalids.push("Water");
        invalids.push("Sand");
        invalids.push("Tree");
        invalids.push("Mountain");
        invalids.push("Stone");
        invalids.push("Pyramid");
        invalids.push("Boat");
        invalids.push("Cave");
        break;
      case "Tree":
        invalids.push("Water");
        invalids.push("Sand");
        invalids.push("Mountain");
        invalids.push("Stone");
        invalids.push("House");
        invalids.push("Pyramid");
        invalids.push("Boat");
        invalids.push("Cave");
        break;
      case "House":
        invalids.push("Sand");
        invalids.push("Stone");
        invalids.push("Water");
        invalids.push("Tree");
        invalids.push("House");
        invalids.push("Pyramid");
        invalids.push("Boat");
        invalids.push("Cave");
        break;
      case "Pyramid":
        invalids.push("Stone");
        invalids.push("Water");
        invalids.push("Grass");
        invalids.push("Tree");
        invalids.push("Mountain");
        invalids.push("House");
        invalids.push("Pyramid");
        invalids.push("Boat");
        invalids.push("Cave");
        break;
      case "Boat":
        invalids.push("Pyramid");
        invalids.push("House");
        invalids.push("Tree");
        invalids.push("Mountain");
        invalids.push("Grass");
        invalids.push("Sand");
        invalids.push("Stone");
        invalids.push("Boat");
        invalids.push("Cave");
        break;
      case "Cave":
        invalids.push("Grass");
        invalids.push("Mountain");
        invalids.push("Tree");
        invalids.push("House");
        invalids.push("Pyramid");
        invalids.push("Boat");
        invalids.push("Sand");
        invalids.push("Water");
          break;

    }
    
    return invalids;
  }

  //get the weight value of a possibility
  //higher = more likely FOR THE MOST PART.
  //be careful when touching ANYTHING here.
  //if Pyramid is .4 and Sand is .5, Sand will only be selected 10% of the time!!!
  getWeight(possibility) {
    switch (possibility) {
      case "Water":
        return 0.45;
      case "Sand":
        return 1.0;
      case "Grass":
        return 0.4;
      case "Tree":
        return 0.9;
      case "LogGrass":
        return 0.91;
      case "Mountain":
        return 0.05;
      case "Stone":
        return 0.7;
      case "House":
        return 0.41;
      case "Pyramid":
        return 0.01;
      case "Cave":
        return 0.65;
      case "Boat":
        return 0.06;
    }
    
    return 1.0;
  }

  //tries to spawn a structure on this tile
  //rare structures like Totems and Towers are less likely to spawn
  //there's no real reason to use seedRandom() here but i do out of habit
  useMap() {
    switch (this.possibilities[0]) {
      case "Grass":
      case "Mountain":
      case "Tree":
        if (this.seedRandom() < .1) {
          this.collapse("Totem");
        }
        else {
          this.collapse("House");
        }
        return;

      case "Sand":
        this.collapse("Pyramid");
        return;

      case "Stone":
        this.collapse("Cave");
        return;

      //does ice = boat make sense? no.
      //but as the player i'd rather get the boat than a wasted map
      case "Water":
      case "Ice":
        this.collapse("Boat");
        return;

      case "Snow":
        if (this.seedRandom() < .1) {
          this.collapse("Tower");
        }

        else {
          this.collapse("SnowmanArmless");
        }
        return;

      //couldn't spawn anything. sorry player :(
      default:
        return;
    }
  }

  //returns possibilities sorted by weight
  //see getWeight() for more info
  sortPossibilities(possibilities) {
    let unsortedPossibilities = [...possibilities]; //our old, ugly, unsorted possibilities
    let sortedPossibilities = []; //our new, clean, sorted possibilities
    
    //while there are unsorted possibilities left...
    while (unsortedPossibilities.length > 0) {
      let lowest = "";
      let lowestWeight = 2.0; //all weight is normalised. 2.0 is greater than any weight. arbitrary value
      
      //get the unsorted possibility with the lowest weight
      for (let i = 0; i < unsortedPossibilities.length; i++) {
        let currPoss = unsortedPossibilities[i];
        if (this.getWeight(currPoss) < lowestWeight) {
          lowest = currPoss;
          lowestWeight = this.getWeight(currPoss);
        }
      }
      
      //add it to the end of sortedPossibilities and remove it from unsortedPossibilities
      sortedPossibilities.push(lowest);
      unsortedPossibilities.splice(unsortedPossibilities.indexOf(lowest), 1);
    }
    
    return sortedPossibilities;
  }
}