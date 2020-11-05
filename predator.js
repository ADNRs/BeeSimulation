class Predator {
  constructor() {
    this.position = new p5.Vector(random(-WIDTH/4, WIDTH/2), random(-HEIGHT/4, -HEIGHT/2.5), random(-DEPTH/4, DEPTH/4))
    this.velocity = p5.Vector.random3D()
    this.velocity.setMag(VEL_LIMIT) // set the magnitude of velocity to VEL_LIMIT
    this.color = PREDATOR_COLOR
    this.life = LIFE_BEE
  }

  _wander() {
      return p5.Vector.random3D()
  }

  _cohere(bees) {
    let position = this.position.copy()

    for (let bee of bees) {
      position.add(bee.position)
    }
    position.div(bees.length + 1)

    let velocity = p5.Vector.sub(position, this.position)

    return velocity
  }

  update(bees) {
    let vC = this._cohere(bees)
    let vW = this._wander()
    vC.setMag(VEL_LIMIT)
    vW.setMag(VEL_LIMIT)
    this.velocity.add(p5.Vector.mult(vC, PRE_COH_MULTIPLIER))
    this.velocity.add(p5.Vector.mult(vW, WAN_MULTIPLIER))

    this.velocity.setMag(VEL_LIMIT*0.8) // set the magnitude of velocity to VEL_LIMIT

    this.position = p5.Vector.add(this.position, this.velocity) // update the position

    // handle the situation of out of boundary
    if (this.position.x < -WIDTH/2) {
      this.position.x = -WIDTH/2
      this.velocity.x = -this.velocity.x
    } else if (this.position.x > WIDTH/2) {
      this.position.x = WIDTH/2
      this.velocity.x = -this.velocity.x
    }
    if (this.position.y < -HEIGHT/2) {
      this.position.y = -HEIGHT/2
      this.velocity.y = -this.velocity.y
    } else if (this.position.y > 0) {
      this.position.y = 0
      this.velocity.y = -this.velocity.y
    }
    if (this.position.z < -DEPTH/2) {
      this.position.z = -DEPTH/2
      this.velocity.z = -this.velocity.z
    } else if (this.position.z > 0) {
      this.position.z = 0
      this.velocity.z = -this.velocity.z
    }
  }

  draw() {
    push()
    translate(this.position)
    fill(this.color)
    noStroke()
    sphere(24)
    pop()
  }

  isDead() {
    return this.life <= 0
  }
}
