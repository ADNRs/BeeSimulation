var Colony = function(color, numBee, lifeBee, hivePos, atkRate) {
  this.currBees
  this.attackers
  this.collectors
  this.octree
  this.color   = color
  this.numBee  = numBee
  this.lifeBee = lifeBee
  this.hivePos = hivePos
  this.atkRate = atkRate
  this.food    = 0
  this.reset()
}

Colony.prototype._genBee = function(sep, ali, coh, sen, mem, wan, atk, dist, angle) {
  return new Bee(
    this.color,
    this.lifeBee,
    this.hivePos,
    new ColonyParams(
      sep, ali, coh, sen, mem, wan, atk, dist, angle, this.attackers.length < this.currBees.length*this.atkRate ? ATTACKER : COLLECTOR
    )
  )
}

Colony.prototype.genBee = function() {
  return this._genBee(SEP, ALI, COH, SEN, MEM, WAN, ATK, DIST, ANGLE)
}

Colony.prototype.reset = function() {
  this.currBees = new Array()
  this.attackers = new Array()
  this.collectors = new Array()
  this.food     = 0

  for (let i = 0; i < this.numBee; i++) {
    let bee = this.genBee()
    this.currBees.push(bee)
    if (bee.colonyParams.type == ATTACKER) {
      this.attackers.push(bee)
    }
    else {
      this.collectors.push(bee)
    }
  }
}

Colony.prototype.storeFood = function() {
  for (let bee of this.currBees) {
    if (bee.position.dist(this.hivePos) < CHK_DIST) {
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
    if (this.currBees[i].life <= 0) {
      removeBeeIdx.push(i)
    }
  }
  removeBeeIdx.reverse()
  for (let i of removeBeeIdx) {
    this.currBees.splice(i, 1)
  }

  removeBeeIdx = new Array()
  for (let i = 0; i < this.attackers.length; i++) {
    if (this.attackers[i].life <= 0) {
      removeBeeIdx.push(i)
    }
  }
  removeBeeIdx.reverse()
  for (let i of removeBeeIdx) {
    this.attackers.splice(i, 1)
  }

  removeBeeIdx = new Array()
  for (let i = 0; i < this.collectors.length; i++) {
    if (this.collectors[i].life <= 0) {
      removeBeeIdx.push(i)
    }
  }
  removeBeeIdx.reverse()
  for (let i of removeBeeIdx) {
    this.collectors.splice(i, 1)
  }
}

Colony.prototype.giveBirth = function() {
  for (; this.food >= BEE_COST; this.food -= BEE_COST) {
    let bee = this.genBee()
    this.currBees.push(bee)
    if (bee.colonyParams.type == ATTACKER) {
      this.attackers.push(bee)
    }
    else {
      this.collectors.push(bee)
    }
  }
}

Colony.prototype.rebalance = function() {
  let currNum = this.currBees.length
  let atkNum  = this.attackers.length
  let collNum = this.collectors.length
  if (atkNum < currNum*this.atkRate) {
    for (let i = 0; i < currNum*this.atkRate - atkNum; i++) {
      this.attackers.push(this.collectors.pop())
    }
  }
  else {
    for (let i = 0; i < currNum*(1 - this.atkRate) - collNum; i++) {
      this.collectors.push(this.attackers.pop())
    }
  }
}

Colony.prototype.update = function(flowers, otherBees) {
  // build octree to speed up the searching of neighbors
  this.octree = new Octree(new Cuboid(new p5.Vector(0, 0, 0), new p5.Vector(WIDTH/2, HEIGHT/2, DEPTH/2)), 50)
  this.octree.build([...this.currBees].map(i => ({...i})))

  // update the location of bees
  for (let bee of this.currBees) {
    let searchCuboid = new Cuboid(bee.position, new p5.Vector(this.beeDist, this.beeDist, this.beeDist))
    bee.update(this.octree.search(searchCuboid), flowers, otherBees)
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
  this.dist     = dist
  this.angle    = angle
  this.type     = type
}
