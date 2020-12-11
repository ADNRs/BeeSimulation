class Environment {
  constructor() {
    this.colonies = new Array()
    this.flowersGroup = new Array()
    this.colonies_init()
    this.foods_init()
  }

  colonies_init() {
    let Y = [0xF2, 0xA1, 0x04]
    let R = [0xFF, 0x00, 0x00]
    let O = [0xD7, 0x54, 0x04]
    let W = [0xFF, 0xFF, 0xFF]

    this.colonies.push(
      new Colony(Y, BEE_NUM, BEE_LIFE, createVector(-WIDTH/2, -HEIGHT/2, 0), ATK_RATE)
    )

    this.colonies.push(
      new Colony(R, BEE_NUM, BEE_LIFE, createVector(WIDTH/2, -HEIGHT/2, -DEPTH/2), ATK_RATE)
    )

    // this.colonies.push(
    //   new Colony(O, BEE_NUM, BEE_LIFE, createVector(-WIDTH/2, -HEIGHT/2, -DEPTH/2), ATK_RATE)
    // )
    //
    // this.colonies.push(
    //   new Colony(W, BEE_NUM, BEE_LIFE, createVector(WIDTH/2, -HEIGHT/2, 0), ATK_RATE)
    // )
  }

  foods_init() {
    let P = [0xFF, 0xA0, 0xA0]
    let G = [0xB9, 0xC4, 0x06]
    let PURPLE = [0x52, 0x2E, 0x75]
    let DB = [0x01, 0x21, 0x72]

    this.flowersGroup.push(
      new Flowers(P, FLOWER_NUM, FLOWER_LIFE, [-WIDTH/2 + 0.15*WIDTH, 0 - 0.15*WIDTH], 0.1*WIDTH, FLOWER_PROB)
    )

    this.flowersGroup.push(
      new Flowers(G, FLOWER_NUM, FLOWER_LIFE, [WIDTH/2 - 0.15*WIDTH, -DEPTH/2 + 0.15*WIDTH], 0.1*WIDTH, FLOWER_PROB)
    )

    // this.flowersGroup.push(
    //   new Flowers(PURPLE, numFlower, lifeFlower, [-WIDTH/2 + 0.15*WIDTH, -DEPTH/2 + 0.15*WIDTH], 0.1*WIDTH, 1)
    // )
    //
    // this.flowersGroup.push(
    //   new Flowers(DB, numFlower, lifeFlower, [WIDTH/2 - 0.15*WIDTH, 0 - 0.15*WIDTH], 0.1*WIDTH, 1)
    // )
  }

  reset() {
    for (let colony of this.colonies) {
      colony.reset()
    }

    for (let flowers of this.flowersGroup) {
      flowers.reset()
    }
  }

  draw() {
    for (let colony of this.colonies) {
      colony.draw()
    }

    for (let flowers of this.flowersGroup) {
      flowers.draw()
    }
  }

  update() {
    // store food
    for (let colony of this.colonies) {
      colony.storeFood()
    }

    // age
    for (let colony of this.colonies) {
      colony.decreaseLife()
    }

    // collect food
    let bees = new Array()
    for (let colony of this.colonies) {
      bees = bees.concat(colony.collectors)
    }
    for (let flowers of this.flowersGroup) {
      flowers.decreaseLife(bees)
    }

    // attacker attacks
    for (let i = 0; i < this.colonies.length; i++) {
      let otherBees = new Array()
      for (let j = 0; j < this.colonies.length; j++) {
        if (i != j) {
          otherBees = otherBees.concat(this.colonies[j].currBees)
        }
      }
      let beeOctree = new Octree(new Cuboid(new p5.Vector(0, 0, 0), new p5.Vector(WIDTH/2, HEIGHT/2, DEPTH/2)), 100)
      beeOctree.build(otherBees)
      for (let bee of this.colonies[i].attackers) {
        let searchCuboid = new Cuboid(bee.position, new p5.Vector(CHK_DIST, CHK_DIST, CHK_DIST))
        for (let otherBee of beeOctree.search(searchCuboid)) {
          otherBee.life -= ATK_DMG
          break
        }
      }
    }

    // remove death
    for (let cluster of this.colonies.concat(this.flowersGroup)) {
      cluster.removeDeath()
    }

    // rebalance
    // for (let colony of this.colonies) {
    //   colony.rebalance()
    // }

    // give birth
    for (let cluster of this.colonies.concat(this.flowersGroup)) {
      cluster.giveBirth()
    }

    // update colony
    let flora = new Array()
    for (let flowers of this.flowersGroup) {
      flora = flora.concat(flowers.currFlowers)
    }
    for (let i = 0; i < this.colonies.length; i++) {
      let otherBees = new Array()
      for (let j = 0; j < this.colonies.length; j++) {
        if (i != j) {
          otherBees = otherBees.concat(this.colonies[j].currBees)
        }
      }
      this.colonies[i].update(flora, otherBees)
    }
  }

  print_state() {
    let msg = ''
    for (let i = 0; i < this.colonies.length; i++) {
      msg += 'Colony ' + str(i) + ': ' + this.colonies[i].currBees.length + ', '
    }
    msg = msg.slice(0, msg.length-2)
    console.log(msg)
  }
}
