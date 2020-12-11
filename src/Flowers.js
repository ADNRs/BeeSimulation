class Flowers {
  constructor(color, numFlower, lifeFlower, center, radius, prob) {
    this.currFlowers
    this.color      = color
    this.numFlower  = numFlower
    this.lifeFlower = lifeFlower
    this.center     = center
    this.radius     = radius
    this.prob       = prob
  }

  genFlower() {
    let position = createVector(this.center[0], random(HEIGHT/3.5, HEIGHT/2.5), this.center[1])
    position.x = position.x + random(-1, 1)*this.radius
    position.z = position.z + random(-1, 1)*this.radius
    return new Flower(this.color, this.lifeFlower, position)
  }

  reset() {
    this.currFlowers = new Array()

    for (let i = 0; i < this.numFlower; i++) {
      this.currFlowers.push(this.genFlower())
    }
  }

  decreaseLife(bees) {
    let beeOctree = new Octree(new Cuboid(new p5.Vector(0, 0, 0), new p5.Vector(WIDTH/2, HEIGHT/2, DEPTH/2)), 100)
    beeOctree.build(bees)
    for (let flower of this.currFlowers) {
      let searchCuboid = new Cuboid(flower.position, new p5.Vector(CHK_DIST, CHK_DIST, CHK_DIST))
      for (let bee of beeOctree.search(searchCuboid)) {
        if (!bee.gotFood) {
          bee.gotFood = true
          bee.prevPos = flower.position
          flower.life -= 1
          break
        }
      }
    }
  }

  removeDeath() {
    let removeFlowerIdx = new Array()
    for (let i = 0; i < this.currFlowers.length; i++) {
      if (this.currFlowers[i].life <= 0) {
        removeFlowerIdx.push(i)
      }
    }
    removeFlowerIdx.reverse()
    for (let i of removeFlowerIdx) {
      this.currFlowers.splice(i, 1)
    }
  }

  giveBirth() {
    for (let i = this.numFlower - this.currFlowers.length; i > 0; i--) {
      if (Math.random() > this.prob) {
        break;
      }
        this.currFlowers.push(this.genFlower())
    }
  }

  draw() {
    for (let Flower of this.currFlowers) {
      Flower.draw()
    }
  }
}
