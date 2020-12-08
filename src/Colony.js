function Colony(color, numBees, lifeBee, hivePos) {
  this.currBees
  this.octree
  this.color    = color
  this.numBees  = numBees
  this.lifeBee  = lifeBee
  this.hivePos  = hivePos
  this.sep      = SEP_MULTIPLIER
  this.ali      = ALI_MULTIPLIER
  this.coh      = COH_MULTIPLIER
  this.sen      = SEN_MULTIPLIER
  this.wan      = WAN_MULTIPLIER
  this.atk      = ATK_MULTIPLIER
  this.beeDist  = NEIGHBOR_DIST
  this.beeAngle = NEIGHBOR_ANGLE
  this.food     = 0
  this.reset()
}

Colony.prototype = Object.create(Cluster.prototype)

Colony.prototype.reset = function() {
  this.currBees = new Array()
  this.food     = 0

  for (let i = 0; i < this.numBees; i++) {
    this.currBees.push(new Bee(this))
  }
}

Colony.prototype.storeFood = function() {
  for (let bee of this.currBees) {
    if (bee.position.dist(this.hivePos) < CHECK_DIST) {
      if (bee.gotFood) {
        this.food += 1
      }

      bee.gotFood = false
    }
  }
}

Colony.prototype.decreaseLife = function() {
  for (let bee of this.currBees) {
    bee.life -= 1
  }
}

Colony.prototype.removeDeath = function() {
  let removeBeeIdx = new Array()
  for (let i = 0; i < this.currBees.length; i++) {
    if (this.currBees[i].life == 0) {
      removeBeeIdx.push(i)
    }
  }
  removeBeeIdx.reverse()
  for (let i of removeBeeIdx) {
    this.currBees.splice(i, 1)
  }
}

Colony.prototype.giveBirth = function() {
  for (; this.food >= NEW_BEE_COST; this.currBees.push(new Bee(this)), this.food -= NEW_BEE_COST);
}

Colony.prototype.update = function() {
  // build octree to speed up the searching of neighbors
  this.octree = new Octree(new Cuboid(new p5.Vector(0, 0, 0), new p5.Vector(WIDTH/2, HEIGHT/2, DEPTH/2)), 50)
  this.octree.build([...this.currBees].map(i => ({...i})))

  // update the location of bees
  for (let bee of this.currBees) {
    let searchCuboid = new Cuboid(bee.position, new p5.Vector(this.beeDist, this.beeDist, this.beeDist))
    bee.update(this.octree.search(searchCuboid), [], [])
  }
}

Colony.prototype.draw = function() {
  for (let bee of this.currBees) {
    bee.draw()
  }

  // draw hive
  push()
  translate(this.hivePos)
  fill(this.color)
  noStroke()
  ellipsoid(100, 200, 100)
  pop()
}
