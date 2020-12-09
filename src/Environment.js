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
    let numBee = 1
    let lifeBee = 500

    this.colonies.push(
      new Colony(Y, numBee, lifeBee, createVector(-WIDTH/2, -HEIGHT/2, 0))
    )

    this.colonies.push(
      new Colony(R, numBee, lifeBee, createVector(WIDTH/2, -HEIGHT/2, -DEPTH/2))
    )

    this.colonies.push(
      new Colony(O, numBee, lifeBee, createVector(-WIDTH/2, -HEIGHT/2, -DEPTH/2))
    )

    this.colonies.push(
      new Colony(W, numBee, lifeBee, createVector(WIDTH/2, -HEIGHT/2, 0))
    )
  }

  foods_init() {
    let P = [0xFF, 0xA0, 0xA0]
    this.flowersGroup.push(
      new Flowers(P, 80, 800)
    )
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
    for (let colony of this.colonies) {
      colony.storeFood()
    }

    for (let colony of this.colonies) {
      colony.decreaseLife()
    }

    let bees = new Array()
    for (let colony of this.colonies) {
      bees = bees.concat(colony.currBees)
    }
    for (let flowers of this.flowersGroup) {
      flowers.decreaseLife(bees)
    }

    for (let colony of this.colonies) {
      colony.removeDeath()
    }

    for (let flowers of this.flowersGroup) {
      flowers.removeDeath()
    }

    for (let colony of this.colonies) {
      colony.giveBirth()
    }


    let flora = new Array()
    for (let flowers of this.flowersGroup) {
      flora = flora.concat(flowers.currFlowers)
    }
    for (let colony of this.colonies) {
      colony.update(flora)
    }
  }
}
