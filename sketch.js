let WIDTH
let HEIGHT
let DEPTH

let NUM_BOIDS = 1000
let VEL_LIMIT = 8 // limit of velocity

let DIST = 100
let ANGLE = 120
let SEP_MULTIPLIER = 0.1
let ALI_MULTIPLIER = 0.1
let COH_MULTIPLIER = 0.1

let BG_COLOR = [0x07, 0x00, 0x0E]
let AXIS_COLOR = [0xF0, 0x8B, 0x33]
let BOID_COLOR = [0xD7, 0x54, 0x04]

let currBoids
let prevBoids

function setup() {
  // set width, height, and depth according to the browser
  WIDTH = windowWidth
  HEIGHT = windowHeight
  DEPTH = WIDTH + HEIGHT

  // initial setup for drawing
  createCanvas(WIDTH, HEIGHT, WEBGL)
  angleMode(DEGREES)
  reset()

  // show frame rate every second in the console
  setInterval(function()  { console.log(frameRate()) }, 1000)
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
  // set background color
  background(BG_COLOR)

  // set light location
  ambientLight(100)
  pointLight(0xFF, 0xFF, 0xFF, -DEPTH/2, -HEIGHT/2, DEPTH/2)

  // draw the cuboid that boids move around
  stroke(AXIS_COLOR)
  strokeWeight(5)
  line(WIDTH/2, HEIGHT/2, -DEPTH/2, WIDTH/2, HEIGHT/2, DEPTH/2)
  line(WIDTH/2, -HEIGHT/2, -DEPTH/2, WIDTH/2, -HEIGHT/2, DEPTH/2)
  line(-WIDTH/2, HEIGHT/2, -DEPTH/2, -WIDTH/2, HEIGHT/2, DEPTH/2)
  line(-WIDTH/2, -HEIGHT/2, -DEPTH/2, -WIDTH/2, -HEIGHT/2, DEPTH/2)
  line(WIDTH/2, HEIGHT/2, -DEPTH/2, -WIDTH/2, HEIGHT/2, -DEPTH/2)
  line(WIDTH/2, HEIGHT/2, -DEPTH/2, WIDTH/2, -HEIGHT/2, -DEPTH/2)
  line(WIDTH/2, -HEIGHT/2, -DEPTH/2, -WIDTH/2, -HEIGHT/2, -DEPTH/2)
  line(-WIDTH/2, HEIGHT/2, -DEPTH/2, -WIDTH/2, -HEIGHT/2, -DEPTH/2)

  // draw each boid
  for (let boid of currBoids) {
    boid.draw()
  }

  // deep copy currBoids
  prevBoids = [...currBoids].map(i => ({ ...i}))

  // build octree to speed up the searching of neighbors
  let octree = new Octree(new Cuboid(new p5.Vector(0, 0, 0), new p5.Vector(WIDTH/2, HEIGHT/2, DEPTH/2)), 100)
  octree.build(prevBoids)

  // update the location of each boid
  for (let boid of currBoids) {
    let searchCuboid = new Cuboid(boid.position, new p5.Vector(DIST, DIST, DIST))
    boid.update(octree.search(searchCuboid))
  }
}

class Boid {
  constructor() {
    this.position = new p5.Vector(random(-WIDTH/2, WIDTH/2), random(-HEIGHT/2, HEIGHT/2), random(-DEPTH/2, DEPTH/2))
    this.velocity = p5.Vector.random3D()
    this.velocity.setMag(VEL_LIMIT) // set the magnitude of velocity to VEL_LIMIT
    this.color = BOID_COLOR
  }

  _searchNeighbors(boids) {
    // set some lambda functions for further usage
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

  update(boids) {
    let neighbors = this._searchNeighbors(boids)
    let vS = this._separate(neighbors)
    let vA = this._align(neighbors)
    let vC = this._cohere(neighbors)
    vS.setMag(VEL_LIMIT) // set the magnitude of the velocity of alignment to VEL_LIMIT
    vA.setMag(VEL_LIMIT) // set the magnitude of the velocity of seperation to VEL_LIMIT
    vC.setMag(VEL_LIMIT) // set the magnitude of the velocity of cohesion to VEL_LIMIT
    this.velocity.add(p5.Vector.mult(vS, SEP_MULTIPLIER))
    this.velocity.add(p5.Vector.mult(vA, ALI_MULTIPLIER))
    this.velocity.add(p5.Vector.mult(vC, COH_MULTIPLIER))

    this.velocity.setMag(VEL_LIMIT) // set the magnitude of velocity to VEL_LIMIT

    this.position = p5.Vector.add(this.position, this.velocity) // update the position

    // handle the situation of out of boundary
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
