class Food {
  constructor(life) {
    this.position = new p5.Vector(random(-WIDTH/2, WIDTH/2), random(HEIGHT/4, HEIGHT/2.5), random(-DEPTH/2, 0))
    this.life = life
  }

  draw() {
    push()
    // draw sphere
    translate(this.position)
    fill([0xFF, 0xA0, 0xA0])
    noStroke()
    sphere((this.life+1) * 2)

    // draw cylinder
    let h = HEIGHT/2 - this.position.y
    translate(0, h/2, 0)
    fill([0x00, 0xE0, 0x00])
    cylinder(2, h)
    pop()
  }
}