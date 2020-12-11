class Colony {
  constructor(color, numBee, lifeBee, hivePos, atkRate) {
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

  _genBee(sep, ali, coh, sen, mem, wan, atk, dist, angle) {
    return new Bee(
      this.color,
      this.lifeBee,
      this.hivePos,
      new ColonyParams(
        sep, ali, coh, sen, mem, wan, atk, dist, angle, this.attackers.length < this.currBees.length*this.atkRate ? ATTACKER : COLLECTOR
      )
    )
  }

  genBee() {
    return this._genBee(SEP, ALI, COH, SEN, MEM, WAN, ATK, DIST, ANGLE)
  }

  reset() {
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

  storeFood() {
    for (let bee of this.currBees) {
      if (bee.position.dist(this.hivePos) < CHK_DIST) {
        if (bee.gotFood) {
          this.food += 1
        }

        bee.gotFood = false
      }
    }
  }

  decreaseLife() {
    for (let bee of this.currBees) {
      bee.life -= 1
    }
  }

  removeDeath() {
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

  giveBirth() {
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

  rebalance() {
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

  update(flowers, otherBees) {
    // build octree to speed up the searching of neighbors
    this.octree = new Octree(new Cuboid(new p5.Vector(0, 0, 0), new p5.Vector(WIDTH/2, HEIGHT/2, DEPTH/2)), 50)
    this.octree.build([...this.currBees].map(i => ({...i})))

    // update the location of bees
    for (let bee of this.currBees) {
      let searchCuboid = new Cuboid(bee.position, new p5.Vector(bee.colonyParams.dist, bee.colonyParams.dist, bee.colonyParams.dist))
      bee.update(this.octree.search(searchCuboid), flowers, otherBees)
    }
  }

  draw() {
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
}

class ColonyParams {
  constructor(sep, ali, coh, sen, mem, wan, atk, dist, angle, type) {
    this.sep   = sep
    this.ali   = ali
    this.coh   = coh
    this.sen   = sen
    this.mem   = mem
    this.wan   = wan
    this.atk   = atk
    this.dist  = dist
    this.angle = angle
    this.type  = type
  }
}
