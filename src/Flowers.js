var Flowers = function(color, numFlower, lifeFlower) {
  this.currFlowers
  this.color      = color
  this.numFlower  = numFlower
  this.lifeFlower = lifeFlower
}

Flowers.prototype.reset = function() {
  this.currFlowers = new Array()
  for (let i = 0; i < this.numFlower; i++) {
    this.currFlowers.push(new Flower(this.color, this.lifeFlower))
  }
}

Flowers.prototype.decreaseLife = function(bees) {
  let beeOctree = new Octree(new Cuboid(new p5.Vector(0, 0, 0), new p5.Vector(WIDTH/2, HEIGHT/2, DEPTH/2)), 100)
  beeOctree.build(bees)
  for (let flower of this.currFlowers) {
    let searchCuboid = new Cuboid(flower.position, new p5.Vector(CHECK_DIST, CHECK_DIST, CHECK_DIST))
    for (let bee of beeOctree.search(searchCuboid)) {
      if (!bee.gotFood) {
        bee.gotFood = true
        flower.life -= 1
        break
      }
    }
  }
}

Flowers.prototype.removeDeath = function() {
  let removeFlowerIdx = new Array()
  for (let i = 0; i < this.currFlowers.length; i++) {
    if (this.currFlowers[i].life == 0) {
      removeFlowerIdx.push(i)
    }
  }
  removeFlowerIdx.reverse()
  for (let i of removeFlowerIdx) {
    this.currFlowers.splice(i, 1)
  }
}

Flowers.prototype.giveBirth = function() {

}

Flowers.prototype.draw = function() {
  for (let Flower of this.currFlowers) {
    Flower.draw()
  }
}
