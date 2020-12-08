class Environment {
  constructor() {
    this.colonies = new Array()
    this.foods = new Array()
    this.colonies_init()
    this.foods_init()
  }

  colonies_init() {
    let Y = [0xF2, 0xA1, 0x04]
    let R = [0xFF, 0x00, 0x00]
    let O = [0xD7, 0x54, 0x04]
    let W = [0xFF, 0xFF, 0xFF]
    this.colonies.push(
      new Colony(Y, 10, LIFE_BEE, createVector(-WIDTH/2, -HEIGHT/2, 0))
    )

    this.colonies.push(
      new Colony(R, 10, LIFE_BEE, createVector(WIDTH/2, -HEIGHT/2, -DEPTH/2))
    )

    this.colonies.push(
      new Colony(O, 10, LIFE_BEE, createVector(-WIDTH/2, -HEIGHT/2, -DEPTH/2))
    )

    this.colonies.push(
      new Colony(W, 10, LIFE_BEE, createVector(WIDTH/2, -HEIGHT/2, 0))
    )
  }

  foods_init() {
    for (let i = 0; i < 80; i++) {
      this.foods.push(new Food(6))
    }
  }

  reset() {
    for (let colony of this.colonies) {
      colony.reset()
    }
  }

  draw() {
    for (let food of this.foods) {
      food.draw()
    }

    for (let colony of this.colonies) {
      colony.draw()
    }
  }

  update() {
    for (let colony of this.colonies) {
      colony.storeFood()
    }

    for (let colony of this.colonies) {
      colony.decreaseLife()
    }

    // collect food

    for (let colony of this.colonies) {
      colony.removeDeath()
    }

    for (let colony of this.colonies) {
      colony.giveBirth()
    }

    for (let colony of this.colonies) {
      colony.update()
    }
  }
}
