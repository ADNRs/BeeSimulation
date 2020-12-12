class Bee {
  constructor(color, life, hivePos, id, colonyParams) {
    this.position     = new p5.Vector(hivePos.x, hivePos.y, hivePos.z)
    this.velocity     = p5.Vector.random3D()
    this.color        = color
    this.life         = life
    this.hivePos      = hivePos
    this.colonyParams = colonyParams
    this.gotFood      = false
    this.prevPos
    this.id           = id
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
      if (testDist < this.colonyParams.dist && testAngle < this.colonyParams.angle) {
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
    let bestDist = SEN_DIST
    let getVectorsAngle = function(v1, v2) { return acos(v1.dot(v2) / (v1.mag() * v2.mag())) }

    if (this.colonyParams.type == COLLECTOR) {
      if (!this.gotFood) {
        for (let food of foods) {
          let angle = getVectorsAngle(this.velocity, p5.Vector.sub(food.position, this.position))
          if (this.position.dist(food.position) < bestDist && angle < this.colonyParams.angle) {
            bestDist = this.position.dist(food.position)
            velocity = p5.Vector.sub(food.position, this.position)
          }
        }
      }
    }

    return velocity
  }

  _memorize() {
    let velocity = createVector(0, 0, 0)

    if (this.colonyParams.type == COLLECTOR) {
      if (!this.gotFood) {
        if (this.prevPos) {
          velocity = p5.Vector.sub(this.prevPos, this.position)
        }
      }
      else {
        velocity = p5.Vector.sub(this.hivePos, this.position)
      }
    }

    return velocity
  }

  _wander() {
      return p5.Vector.random3D()
  }

  _attack(enemies) {
    let velocity = createVector(0, 0, 0)
    let bestDist = ATK_DIST
    let getVectorsAngle = function(v1, v2) { return acos(v1.dot(v2) / (v1.mag() * v2.mag())) }

    if (this.colonyParams.type == ATTACKER) {
      for (let enemy of enemies) {
        let angle = getVectorsAngle(this.velocity, p5.Vector.sub(enemy.position, this.position))
        if (this.position.dist(enemy.position) < bestDist && angle < this.colonyParams.angle) {
          bestDist = this.position.dist(enemy.position)
          velocity = p5.Vector.sub(enemy.position, this.position)
        }
      }
    }

    return velocity
  }

  update(bees, foods, predators) {
    let neighbors = this._searchNeighbors(bees)
    let vSep      = this._separate(neighbors)
    let vAli      = this._align(neighbors)
    let vCoh      = this._cohere(neighbors)
    let vSen      = this._sense(foods)
    let vMem      = this._memorize()
    let vWan      = this._wander()
    let vAtk      = this._attack(predators)
    vSep.setMag(VEL_LIMIT) // set the magnitude of the velocity of alignment to VEL_LIMIT
    vAli.setMag(VEL_LIMIT) // set the magnitude of the velocity of seperation to VEL_LIMIT
    vCoh.setMag(VEL_LIMIT) // set the magnitude of the velocity of cohesion to VEL_LIMIT
    vSen.setMag(VEL_LIMIT) // set the magnitude of the velocity of sense to VEL_LIMIT
    vMem.setMag(VEL_LIMIT)
    vWan.setMag(VEL_LIMIT) // set the magnitude of the velocity of wander to VEL_LIMIT
    vAtk.setMag(VEL_LIMIT) // set the magnitude of the velocity of attack to VEL_LIMIT
    this.velocity.add(p5.Vector.mult(vSen, this.colonyParams.sep))
    this.velocity.add(p5.Vector.mult(vAli, this.colonyParams.ali))
    this.velocity.add(p5.Vector.mult(vCoh, this.colonyParams.coh))
    this.velocity.add(p5.Vector.mult(vSen, this.colonyParams.sen))
    this.velocity.add(p5.Vector.mult(vMem, this.colonyParams.mem))
    this.velocity.add(p5.Vector.mult(vWan, this.colonyParams.wan))
    this.velocity.add(p5.Vector.mult(vAtk, this.colonyParams.atk))

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
