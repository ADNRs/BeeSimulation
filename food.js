class Food {
  constructor() {
    this.position = new p5.Vector(random(-WIDTH/2, WIDTH/2), random(HEIGHT/4, HEIGHT/2), random(-DEPTH/2, DEPTH/4))
    this.color = FOOD_COLOR
    this.life = LIFE_FOOD
  }

  update() {

  }

  draw() {
    push()
    translate(this.position)
    fill([0xFF, 0xA0, 0xA0])
    noStroke()
    sphere(this.life*3)
    let h = HEIGHT/2 - this.position.y
    translate(0, h/2, 0)
    fill([0x00, 0xE0, 0x00])
    cylinder(3, h)
    pop()
  }

  isDead() {
    return this.life <= 0
  }
}
