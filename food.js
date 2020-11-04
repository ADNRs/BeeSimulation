class Food {
  constructor() {
    this.position = new p5.Vector(random(-WIDTH/2, WIDTH/2), random(-HEIGHT/2, HEIGHT/2), random(-DEPTH/2, DEPTH/4))
    this.color = FOOD_COLOR
    this.life = LIFE_FOOD
  }

  update() {

  }

  draw() {
    push()
    translate(this.position)
    fill(this.color)
    noStroke()
    sphere(8)
    pop()
  }

  isDead() {
    return this.life <= 0
  }
}
