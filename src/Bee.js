class Bee {
  constructor(colony) {
    this.colony   = colony
    this.position = new p5.Vector(colony.hivePos.x, colony.hivePos.y, colony.hivePos.z)
    this.velocity = p5.Vector.random3D()
    this.color    = colony.color
    this.life     = colony.beeLife
    this.gotFood  = false
    this.velocity.setMag(VEL_LIMIT) // set the magnitude of velocity to VEL_LIMIT
  }

  _searchNeighbors(bees) {
    // set some lambda functions for further usage
    let getPointsDist = function(p1, p2) { return p1.dist(p2) }
    let getVectorsAngle = function(v1, v2) { return acos(v1.dot(v2) / (v1.mag() * v2.mag())) }

    let neighbors = new Array()

    for (let bee of bees) {
      let testDist = getPointsDist(this.position, bee.position)
      let testAngle = getVectorsAngle(this.velocity, p5.Vector.sub(bee.position, this.position))
      if (testDist < this.colony.beeDist && testAngle < this.colony.beeAngle) {
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
    let bestDist = SENSE_DIST

    if (!this.gotFood) {
    for (let food of foods) {
        if (this.position.dist(food.position) < bestDist) {
          bestDist = this.position.dist(food.position)
          velocity = p5.Vector.sub(food.position, this.position)
        }
      }
    } else {
      velocity = p5.Vector.sub(this.colony.hivePos, this.position)
    }

    return velocity
  }

  _wander() {
      return p5.Vector.random3D()
  }

  _attack(predators) {
    let velocity = createVector(0, 0, 0)
    let bestDist = SENSE_DIST

    for (let predator of predators) {
        if (this.position.dist(predator.position) < bestDist) {
          bestDist = this.position.dist(predator.position)
          velocity = p5.Vector.sub(predator.position, this.position)
        }
    }

    return velocity
  }

  update(bees, foods, predators) {
    let neighbors = this._searchNeighbors(bees)
    let vS        = this._separate(neighbors)
    let vA        = this._align(neighbors)
    let vC        = this._cohere(neighbors)
    let vSen      = this._sense(foods)
    let vW        = this._wander()
    let vAtk      = this._attack(predators)
    vS.setMag(VEL_LIMIT)   // set the magnitude of the velocity of alignment to VEL_LIMIT
    vA.setMag(VEL_LIMIT)   // set the magnitude of the velocity of seperation to VEL_LIMIT
    vC.setMag(VEL_LIMIT)   // set the magnitude of the velocity of cohesion to VEL_LIMIT
    vSen.setMag(VEL_LIMIT) // set the magnitude of the velocity of sense to VEL_LIMIT
    vW.setMag(VEL_LIMIT)   // set the magnitude of the velocity of wander to VEL_LIMIT
    vAtk.setMag(VEL_LIMIT) // set the magnitude of the velocity of attack to VEL_LIMIT
    this.velocity.add(p5.Vector.mult(vS, this.colony.sep))
    this.velocity.add(p5.Vector.mult(vA, this.colony.ali))
    this.velocity.add(p5.Vector.mult(vC, this.colony.coh))
    this.velocity.add(p5.Vector.mult(vSen, this.colony.sen))
    this.velocity.add(p5.Vector.mult(vW, this.colony.wan))
    this.velocity.add(p5.Vector.mult(vAtk, this.colony.atk))

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
    sphere(12)
    pop()
  }
}