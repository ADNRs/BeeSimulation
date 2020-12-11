class Flower {
  constructor(color, life, position) {
    this.position = position
    this.color = color
    this.life = life
  }

  draw() {
    push()
    // draw sphere
    translate(this.position)
    fill(this.color)
    noStroke()
    sphere(20)

    // draw cylinder
    let h = HEIGHT/2 - this.position.y
    translate(0, h/2, 0)
    fill([0x00, 0xE0, 0x00])
    cylinder(2, h)
    pop()
  }
}
