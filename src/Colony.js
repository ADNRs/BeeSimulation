var Colony = function(color, numBee, lifeBee, hivePos) {
  this.currBees
  this.octree
  this.color    = color
  this.numBee   = numBee
  this.lifeBee  = lifeBee
  this.hivePos  = hivePos
  this.food     = 0
  this.reset()
}

Colony.prototype._genBee = function(sep, ali, coh, sen, mem, wan, atk, dist, angle, type) {
  return new Bee(
    this.color,
    this.lifeBee,
    this.hivePos,
    new ColonyParams(sep, ali, coh, sen, mem, wan, atk, dist, angle, type)
  )
}

Colony.prototype.genBee = function() {
  return this._genBee(
    SEP_MULTIPLIER,
    ALI_MULTIPLIER,
    COH_MULTIPLIER,
    SEN_MULTIPLIER,
    SEN_MULTIPLIER,
    WAN_MULTIPLIER,
    ATK_MULTIPLIER,
    NEIGHBOR_DIST,
    NEIGHBOR_ANGLE,
    COLLECTOR
  )
}

Colony.prototype.reset = function() {
  this.currBees = new Array()
  this.food     = 0

  for (let i = 0; i < this.numBee; i++) {
    this.currBees.push(this.genBee())
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
  for (; this.food >= NEW_BEE_COST; this.currBees.push(this.genBee()), this.food -= NEW_BEE_COST);
}

Colony.prototype.update = function(flowers) {
  // build octree to speed up the searching of neighbors
  this.octree = new Octree(new Cuboid(new p5.Vector(0, 0, 0), new p5.Vector(WIDTH/2, HEIGHT/2, DEPTH/2)), 50)
  this.octree.build([...this.currBees].map(i => ({...i})))

  // update the location of bees
  for (let bee of this.currBees) {
    let searchCuboid = new Cuboid(bee.position, new p5.Vector(this.beeDist, this.beeDist, this.beeDist))
    bee.update(this.octree.search(searchCuboid), flowers, [])
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

var ColonyParams = function(sep, ali, coh, sen, mem, wan, atk, dist, angle, type) {
  this.sep      = sep
  this.ali      = ali
  this.coh      = coh
  this.sen      = sen
  this.mem      = mem
  this.wan      = wan
  this.atk      = atk
  this.beeDist  = dist
  this.beeAngle = angle
  this.type     = type
}
