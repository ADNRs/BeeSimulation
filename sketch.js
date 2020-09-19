let WIDTH
let HEIGHT
let DEPTH

let NUM_BOIDS = 400

let DIST = 100
let ANGLE = 120
let VEL_LIMIT = 50
let SEP_STEP = 0.1
let ALI_STEP = 0.1
let COH_STEP = 0.1
let SEP_DIST = 100
let ALI_DIST = 100
let COH_DIST = 100

let BG_COLOR = [0x07, 0x00, 0x0E]
let AXIS_COLOR = [0xF0, 0x8B, 0x33]
let BOID_COLOR = [0xD7, 0x54, 0x04]

let currBoids
let prevBoids

function setup() {
  WIDTH = windowWidth
  HEIGHT = windowHeight
  DEPTH = WIDTH + HEIGHT
  createCanvas(WIDTH, HEIGHT, WEBGL)
  angleMode(DEGREES)


  reset()
}

function reset() {
  currBoids = new Array()
  prevBoids = new Array()

  for (let i = 0; i < NUM_BOIDS; i++) {
    currBoids.push(new Boid())
  }
}

function mousePressed() {
  reset()
}

function draw() {
  background(BG_COLOR)
  ambientLight(100)
  pointLight(0xFF, 0xFF, 0xFF, -DEPTH/2, -HEIGHT/2, DEPTH/2)

  stroke(AXIS_COLOR)
  strokeWeight(10)
  line(WIDTH/2, HEIGHT/2, -DEPTH/2, WIDTH/2, HEIGHT/2, DEPTH/2)
  line(WIDTH/2, -HEIGHT/2, -DEPTH/2, WIDTH/2, -HEIGHT/2, DEPTH/2)
  line(-WIDTH/2, HEIGHT/2, -DEPTH/2, -WIDTH/2, HEIGHT/2, DEPTH/2)
  line(-WIDTH/2, -HEIGHT/2, -DEPTH/2, -WIDTH/2, -HEIGHT/2, DEPTH/2)
  line(WIDTH/2, HEIGHT/2, -DEPTH/2, -WIDTH/2, HEIGHT/2, -DEPTH/2)
  line(WIDTH/2, HEIGHT/2, -DEPTH/2, WIDTH/2, -HEIGHT/2, -DEPTH/2)
  line(WIDTH/2, -HEIGHT/2, -DEPTH/2, -WIDTH/2, -HEIGHT/2, -DEPTH/2)
  line(-WIDTH/2, HEIGHT/2, -DEPTH/2, -WIDTH/2, -HEIGHT/2, -DEPTH/2)

  for (let boid of currBoids) {
    boid.draw()
  }

  prevBoids = [...currBoids].map(i => ({ ...i}))

  for (let boid of currBoids) {
    boid.update(prevBoids)
  }
}

class Boid {
  constructor() {
    this.position = new p5.Vector(random(-WIDTH/2, WIDTH/2), random(-HEIGHT/2, HEIGHT/2), random(-DEPTH/2, DEPTH/2))
    this.velocity = p5.Vector.mult(p5.Vector.random3D(), VEL_LIMIT)
    this.color = BOID_COLOR
  }

  __searchNeighbors(boids) {
    let getPointsDist = function(p1, p2) { return p1.dist(p2) }
    let getVectorsAngle = function(v1, v2) { return acos(v1.dot(v2) / (v1.mag() * v2.mag())) }

    let neighbors = new Array()

    for (let boid of boids) {
      let testDist = getPointsDist(this.position, boid.position)
      let testAngle = getVectorsAngle(this.velocity, p5.Vector.sub(boid.position, this.position))
      if (testDist < DIST && testAngle < ANGLE) {
        neighbors.push(boid)
      }
    }

    return neighbors
  }

  __separate(neighbors) {
    // let neighbors = this.__searchNeighbors(boids, SEP_DIST, ANGLE)
    let velocity = new p5.Vector(0, 0, 0)

    for (let neighbor of neighbors) {
      velocity.sub(p5.Vector.sub(neighbor.position, this.position))
    }

    return velocity
  }

  __align(neighbors) {
    // let neighbors = this.__searchNeighbors(boids, ALI_DIST, ANGLE)
    let velocity = this.velocity.copy()

    for (let neighbor of neighbors) {
      velocity.add(neighbor.velocity)
    }
    velocity.div(neighbors.length + 1)
    velocity.sub(this.velocity)

    return velocity
  }

  __cohere(neighbors) {
    // let neighbors = this.__searchNeighbors(boids, COH_DIST, ANGLE)
    let position = this.position.copy()

    for (let neighbor of neighbors) {
      position.add(neighbor.position)
    }
    position.div(neighbors.length + 1)

    let velocity = p5.Vector.sub(position, this.position)

    return velocity
  }

  update(boids) {
    let neighbors = this.__searchNeighbors(boids)
    let vS = this.__separate(neighbors)
    let vA = this.__align(neighbors)
    let vC = this.__cohere(neighbors)
    vS.setMag(VEL_LIMIT)
    vA.setMag(VEL_LIMIT)
    vC.setMag(VEL_LIMIT)
    this.velocity.add(p5.Vector.mult(vS, SEP_STEP))
    this.velocity.add(p5.Vector.mult(vA, ALI_STEP))
    this.velocity.add(p5.Vector.mult(vC, COH_STEP))

    this.velocity.setMag(VEL_LIMIT)

    this.position = p5.Vector.add(this.position, this.velocity)

    if (this.position.x < -WIDTH/2) {
      this.position.x = WIDTH/2
    } else if (this.position.x > WIDTH/2) {
      this.position.x = -WIDTH/2
    }
    if (this.position.y < -HEIGHT/2) {
      this.position.y = HEIGHT/2
    } else if (this.position.y > HEIGHT/2) {
      this.position.y = -HEIGHT/2
    }
    if (this.position.z < -DEPTH/2) {
      this.position.z = DEPTH/2
    } else if (this.position.z > DEPTH/2) {
      this.position.z = -DEPTH/2
    }
  }

  draw() {
    push()
    translate(this.position)
    fill(this.color)
    noStroke()
    sphere(8)
    pop()
  }
}
