class Bee {
  constructor() {
    this.position = new p5.Vector(-WIDTH/2, -HEIGHT/2, -DEPTH/2)
    this.velocity = p5.Vector.random3D()
    this.velocity.setMag(VEL_LIMIT) // set the magnitude of velocity to VEL_LIMIT
    this.color = BEE_COLOR
    this.life = LIFE_BEE
    this.gotFood = false
  }

  _searchNeighbors(bees) {
    // set some lambda functions for further usage
    let getPointsDist = function(p1, p2) { return p1.dist(p2) }
    let getVectorsAngle = function(v1, v2) { return acos(v1.dot(v2) / (v1.mag() * v2.mag())) }

    let neighbors = new Array()

    for (let bee of bees) {
      let testDist = getPointsDist(this.position, bee.position)
      let testAngle = getVectorsAngle(this.velocity, p5.Vector.sub(bee.position, this.position))
      if (testDist < DIST && testAngle < ANGLE) {
        neighbors.push(bee)
      }
    }

    return neighbors
  }

  _separate(neighbors) {
    let velocity = new p5.Vector(0, 0, 0)

    for (let neighbor of neighbors) {
      velocity.sub(p5.Vector.sub(neighbor.position, this.position))
    }

    return velocity
  }

  _align(neighbors) {
    let velocity = this.velocity.copy()

    for (let neighbor of neighbors) {
      velocity.add(neighbor.velocity)
    }
    velocity.div(neighbors.length + 1)
    velocity.sub(this.velocity)

    return velocity
  }

  _cohere(neighbors) {
    let position = this.position.copy()

    for (let neighbor of neighbors) {
      position.add(neighbor.position)
    }
    position.div(neighbors.length + 1)

    let velocity = p5.Vector.sub(position, this.position)

    return velocity
  }

  _sense(foods) {
    let velocity = createVector(0, 0, 0)
    let bestDist = DIST * 2

    if (!this.gotFood) {
    for (let food of foods) {
        if (this.position.dist(food.position) < bestDist) {
          bestDist = this.position.dist(food.position)
          velocity = p5.Vector.sub(food.position, this.position)
        }
      }
    } else {
      velocity = p5.Vector.sub(createVector(-WIDTH/2, -HEIGHT/2, -DEPTH/2), this.position)
    }

    return velocity
  }

  _wander() {
      return p5.Vector.random3D()
  }

  update(bees, foods) {
    let neighbors = this._searchNeighbors(bees)
    let vS = this._separate(neighbors)
    let vA = this._align(neighbors)
    let vC = this._cohere(neighbors)
    let vSen = this._sense(foods)
    let vW = this._wander(foods)
    vS.setMag(VEL_LIMIT) // set the magnitude of the velocity of alignment to VEL_LIMIT
    vA.setMag(VEL_LIMIT) // set the magnitude of the velocity of seperation to VEL_LIMIT
    vC.setMag(VEL_LIMIT) // set the magnitude of the velocity of cohesion to VEL_LIMIT
    vSen.setMag(VEL_LIMIT)
    vW.setMag(VEL_LIMIT)
    this.velocity.add(p5.Vector.mult(vS, SEP_MULTIPLIER))
    this.velocity.add(p5.Vector.mult(vA, ALI_MULTIPLIER))
    this.velocity.add(p5.Vector.mult(vC, COH_MULTIPLIER))
    this.velocity.add(p5.Vector.mult(vSen, SEN_MULTIPLIER))
    this.velocity.add(p5.Vector.mult(vW, WAN_MULTIPLIER))

    this.velocity.setMag(VEL_LIMIT) // set the magnitude of velocity to VEL_LIMIT

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
    } else if (this.position.y > HEIGHT/2) {
      this.position.y = HEIGHT/2
      this.velocity.y = -this.velocity.y
    }
    if (this.position.z < -DEPTH/2) {
      this.position.z = -DEPTH/2
      this.velocity.z = -this.velocity.z
    } else if (this.position.z > DEPTH/2) {
      this.position.z = DEPTH/2
      this.velocity.z = -this.velocity.z
    }
  }

  draw() {
    push()
    translate(this.position)
    fill(this.color)
    noStroke()
    sphere(12)
    pop()
  }

  isDead() {
    return this.life <= 0
  }
}
