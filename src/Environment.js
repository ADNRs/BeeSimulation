class Environment {
  constructor() {
    this.colonies = new Array()
    this.flowersGroup = new Array()
    this.ga = new Array()
    this.ga_init()
    this.colonies_init()
    this.foods_init()
    this.frameCount = 0
    this.round      = 0
    this.generation = 0
  }

  ga_init() {
    this.ga.push(new GeneticAlgorithm(CHROMOSOME_NUM))
    this.ga.push(new GeneticAlgorithm(CHROMOSOME_NUM))
  }

  colonies_init() {
    let YELLOW = [0xF2, 0xA1, 0x04]
    let ORANGE = [0xD7, 0x54, 0x04]
    let RED    = [0xFF, 0x00, 0x00]
    this.colonies.push(
      new Colony(
        YELLOW,
        BEE_NUM,
        BEE_LIFE,
        createVector(-WIDTH/2, -HEIGHT/2, 0),
        ATK_RATE,
        this.ga[0].chromosomes,
        this.ga[0].records
      )
    )

    this.colonies.push(
      new Colony(
        RED,
        BEE_NUM,
        BEE_LIFE,
        createVector(WIDTH/2, -HEIGHT/2, -DEPTH/2),
        ATK_RATE,
        this.ga[1].chromosomes,
        this.ga[1].records
      )
    )
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

    this.flowersGroup.push(
      new Flowers(PURPLE, FLOWER_NUM, FLOWER_LIFE, [0, -DEPTH/4], 0.1*WIDTH, FLOWER_PROB)
    )

    // this.flowersGroup.push(
    //   new Flowers(PURPLE, FLOWER_NUM, FLOWER_LIFE, [-WIDTH/2 + 0.15*WIDTH, -DEPTH/2 + 0.15*WIDTH], 0.1*WIDTH, 1)
    // )
    //
    // this.flowersGroup.push(
    //   new Flowers(DB, FLOWER_NUM, FLOWER_LIFE, [WIDTH/2 - 0.15*WIDTH, 0 - 0.15*WIDTH], 0.1*WIDTH, 1)
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
          if (otherBee.life <= 0) {
            this.colonies[i].records[bee.id].kill += 1
          }
          break
        }
      }
    }

    // remove death
    for (let cluster of this.colonies.concat(this.flowersGroup)) {
      cluster.removeDeath()
    }

    // rebalance
    for (let colony of this.colonies) {
      colony.rebalance()
    }

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

    this.frameCount += 1
    if (this.frameCount == FITNESS_INTERVAL) {
      this.round += 1
      if (this.round == 3) {
        for (let i = 0; i < this.ga.length; i++) {
          this.ga[i].evaluate()
          this.colonies[i].chromosomes = this.ga[i].chromosomes
        }
        this.round = 0
        this.generation += 1
        this.print_state()
      }
      this.frameCount = 0
      this.reset()
    }
  }

  print_state() {
    console.log('Gen: ' + str(this.generation))
    for (let i = 0; i < this.colonies.length; i++) {
      console.log('Colony ' + str(i) + ': ' + this.colonies[i].currBees.length)
      console.log(...this.ga[i].bestChromosome)
    }
  }
}
