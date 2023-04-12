class Tile {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.img;

    this.adjacent = [];
    this.corners = [];

    this.possibilities = [];

    this.possibilities.push("Grass");
    this.possibilities.push("Water");
    this.possibilities.push("Sand");
    this.possibilities.push("Tree");
    this.possibilities.push("Mountain");
    this.possibilities.push("Stone");
    this.possibilities.push("Boat");

    if (seed % 2 === 1) {
      this.possibilities.push("House");
    }
    if (seed % 4 === 1) {
      this.possibilities.push("Pyramid");
    }

    this.collapsed = false;
  }

  draw() {
    drawOnGrid(this.img, this.x, this.y);
    //image(this.img, scale * this.x + scale/2, scale * this.y + scale/2, scale, scale);
    //console.log("   Drew " + this.possibilities[0] + " (" + this.x + ", " + this.y + ")");
  }

  getImage() {
    return loadImage('images/' + this.possibilities[0] + '.png');
  }

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

  collapsePossibilities() {
    const finalPossibility = this.getBestCollapsePossibility();
    this.collapse(finalPossibility);
  
    this.updateAdjacent();
    this.updateCorners();
  }
  
  collapse(ID) {
    this.collapsed = true;
    this.possibilities = [];
    this.possibilities.push(ID);

    //console.log("   Confirmed as " + this.possibilities[0]);
    this.img = this.getImage();
  }
  
  getBestCollapsePossibility() {
    const rand = this.seedRandom();
    const sortedPossibilities = this.sortPossibilities(this.possibilities);
  
    for (let i = 0; i < sortedPossibilities.length; i++) {
      if (this.getWeight(sortedPossibilities[i]) > rand) {
        return sortedPossibilities[i];
      }
    }
  
    if (sortedPossibilities.length === 0) {
      if (possibilities.length === 0) {
        return "Stone";
      }
      return possibilities[0];
    }
    return sortedPossibilities[0];
  }
  
  updateAdjacent() {
    for (let i = 0; i < this.adjacent.length; i++) {
      this.adjacent[i].removePossibilities(this.getInvalidAdjacentPossibilities(this.possibilities[0]));
    }
  }
  
  updateCorners() {
    for (let i = 0; i < this.corners.length; i++) {
      this.corners[i].removePossibilities(this.getInvalidAdjacentPossibilities(this.possibilities[0]));
    }
  }
  
  removePossibilities(removePossibilities) {
    for (let i = 0; i < removePossibilities.length; i++) {
      this.possibilities = this.possibilities.filter((possibility) => possibility !== removePossibilities[i]);
    }
  }
  
  doesAdjacentContain(possibility) {
    for (let i = 0; i < adjacent.length; i++) {
      if (adjacent[i].possibilities.includes(possibility)) {
        return true;
      }
    }
    return false;
  }
  
  firstPass() {
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
      case "Tree":
        this.fellTrees();
    }
  }
  
  secondPass() {
    switch (this.possibilities[0]) {
      case "Sand":
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
          this.collapse("Sand");
          break;
        case "Mountain":
        case "Tree":
          if (this.seedRandom() < 0.7)
            this.collapse("Grass");
          break;
        case "Water":
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
          this.collapse("House");
          break;
        case "Water":
        case "Sand":
          if (this.seedRandom() < 0.7)
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
          this.collapse("Pyramid");
          break;
        case "Water":
          this.collapse("Stone");
          break;
      }
    }
  }

  fellTrees() {
    if (this.seedRandom() < .3 && this.countAdjacent("Tree") <= 2 && this.countAllNear("Log") <= 0) {
      this.collapse("Log");
    }
  }
  
  growGrass() {
    if (this.countAdjacent("Grass") >= 5 && this.countAllNear("Water") <= 0) {
      this.collapse("Grass");
    }
  }
  
  cleanOceanSand() {
    if (this.countAllNear("Water") >= 3) {
      this.collapse("Water");
    }
  }
  
  drySmallPonds() {
    if (this.countAllNear("Water") <= 0) {
      this.collapse("Grass");
    }
  }
  
  breakIntoSand() {
    if (this.countAllNear("Sand") >= 1 && this.countAllNear("Grass") >= 3) {
      this.collapse("Sand");
    }
  }
  
  pool() {
    if (this.countAllNear("Stone") >= 3) {
      this.collapse("Water");
    }
  }
  
  isolatePyramids() {
    if (this.countAllNear("Pyramid") >= 1) {
      this.collapse("Sand");
    }
  }

  furnishHouse() {
    if (this.seedRandom() < .2 && this.countAllNear("Wall") >= 3) {
      this.collapse("Table");
    }
    else if (this.seedRandom() < .2 && this.countAllNear("Table") >= 1) {
      this.collapse("Stool");
    }
  }
  
  countAdjacent(possibility) {
    let ct = 0;
  
    for (let i = 0; i < this.adjacent.length; i++) {
      if (this.adjacent[i].possibilities.includes(possibility)) {
        ct++;
      }
    }
  
    return ct;
  }
  
  countCorners(possibility) {
    let ct = 0;
  
    for (let i = 0; i < this.corners.length; i++) {
      if (this.corners[i].possibilities.includes(possibility)) {
        ct++;
      }
    }
  
    return ct;
  }
  
  countAllNear(possibility) {
    return this.countAdjacent(possibility) + this.countCorners(possibility);
  }
  
  removeIsolated() {
    if (this.seedRandom() < 0.4 && this.possibilities[0] != "Mountain" && this.possibilities[0] != "Tree" && this.possibilities[0] != "Pyramid") {
      let all = this.adjacent.concat(this.corners);
      for (let i = 0; i < all.length; i++) {
        if (all[i].possibilities.includes(this.possibilities[0])) {
          return;
        }
      }
  
      this.collapse(all[0].possibilities[0]);
    }
  }
  
  seedRandom() {
    seedOffset = ((seedOffset * seedOffset) % 13131) * 3;
  
    let seedRandom = (seed + seedOffset) % 100.0 / 100.0;
  
    //console.log("Weight: " + seedPosition);
    return seedRandom;
  }

  getInvalidAdjacentPossibilities(possibility) {
    let invalids = [];
    
    switch (possibility) {
      case "Water":
        invalids.push("Grass");
        invalids.push("Mountain");
        invalids.push("Tree");
        invalids.push("House");
        invalids.push("Pyramid");
        break;
      case "Sand":
        invalids.push("Mountain");
        invalids.push("Tree");
        invalids.push("Stone");
        invalids.push("House");
        invalids.push("Boat");
        break;
      case "Grass":
        invalids.push("Water");
        invalids.push("Pyramid");
        invalids.push("Boat");
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
        break;
      case "Tree":
        invalids.push("Water");
        invalids.push("Sand");
        invalids.push("Mountain");
        invalids.push("Stone");
        invalids.push("House");
        invalids.push("Pyramid");
        invalids.push("Boat");
        break;
      case "House":
        invalids.push("Sand");
        invalids.push("Stone");
        invalids.push("Water");
        invalids.push("Tree");
        invalids.push("House");
        invalids.push("Pyramid");
        invalids.push("Boat");
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
        break;

    }
    
    return invalids;
  }

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
      case "Log":
        return 0.91;
      case "Mountain":
        return 0.05;
      case "Stone":
        return 0.7;
      case "House":
        return 0.41;
      case "Pyramid":
        return 0.01;
      case "Boat":
        return 0.06;
    }
    
    return 1.0;
  }

  sortPossibilities(possibilities) {
    let unsortedPossibilities = [...possibilities];
    let sortedPossibilities = [];
    
    while (unsortedPossibilities.length > 0) {
      let lowest = "";
      let lowestWeight = 2.0;
      
      for (let i = 0; i < unsortedPossibilities.length; i++) {
        let currPoss = unsortedPossibilities[i];
        if (this.getWeight(currPoss) < lowestWeight) {
          lowest = currPoss;
          lowestWeight = this.getWeight(currPoss);
        }
      }
      
      sortedPossibilities.push(lowest);
      unsortedPossibilities.splice(unsortedPossibilities.indexOf(lowest), 1);
    }
    
    return sortedPossibilities;
  }
}