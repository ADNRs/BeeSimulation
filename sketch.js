let WIDTH
let HEIGHT
let DEPTH

let COLOR = [30, 255, 130]
let DISTANCE = 50
let ANGLE = 150
let NUM_BOIDS = 300

let VECT_LIMIT = 3

let INIT_STEP = 3
let SEP_STEP = 1
let ALI_STEP = 1
let COH_STEP = 1

let currBoids
let prevBoids

function setup() {
  WIDTH = windowWidth
  HEIGHT = windowHeight
  DEPTH = WIDTH
  createCanvas(WIDTH, HEIGHT, WEBGL)
  debugMode(AXES)
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
  background(100, 200, 255)
  ambientLight(100)
  pointLight(255, 255, 255, 0, 0, DEPTH*2)

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
    this.coord = new p5.Vector(random(-WIDTH/2, WIDTH/2), random(-HEIGHT/2, HEIGHT/2), random(-DEPTH/2, DEPTH/2))
    this.vect = p5.Vector.mult(p5.Vector.random3D(), INIT_STEP)
    this.color = [random(256), random(256), random(256)]
    this.dist = DISTANCE
    this.angle = ANGLE
  }

  searchNeighbors(boids) {
    let getPointsDist = function(p1, p2) { return p1.dist(p2) }
    let getVectorsAngle = function(v1, v2) { return acos(v1.dot(v2) / (v1.mag() * v2.mag())) }

    let neighbors = new Array()

    for (let boid of boids) {
      let dist = getPointsDist(this.coord, boid.coord)
      let angle = getVectorsAngle(this.vect, p5.Vector.sub(boid.coord, this.coord))
      if (dist < DISTANCE && angle < ANGLE) {
        neighbors.push(boid)
      }
    }
    return neighbors
  }

  separate(neighbors) {
    let v = new p5.Vector(0, 0, 0)

    for (let neighbor of neighbors) {
      let vPrime = p5.Vector.sub(neighbor.coord, this.coord)
      v.add(vPrime)
    }

    return p5.Vector.mult(v, -1)
  }

  align(neighbors) {
    let v = this.vect.copy()

    for (let neighbor of neighbors) {
      v.add(neighbor.vect)
    }

    return p5.Vector.div(v, neighbors.length + 1)
  }

  cohere(neighbors) {
    let m = new p5.Vector(0, 0, 0)

    for (let neighbor of neighbors) {
      m.add(neighbor.coord)
    }
    m.div(neighbors.length + 1)

    if (m.x == 0 && m.y == 0 && m.z == 0) {
      return m
    }
    return p5.Vector.sub(m, this.coord)
  }

  update(boids) {
    let neighbors = this.searchNeighbors(boids)
    let vS = this.separate(neighbors)
    let vA = this.align(neighbors)
    let vC = this.cohere(neighbors)
    // this.vect.add(p5.Vector.mult(vS, SEP_STEP))
    this.vect.add(p5.Vector.mult(vA, ALI_STEP))
    // this.vect.add(p5.Vector.mult(vC, COH_STEP))

    if (this.vect.mag() > VECT_LIMIT) {
      this.vect.mult(VECT_LIMIT/this.vect.mag())
    }

    this.coord = p5.Vector.add(this.coord, this.vect)
    if (this.coord.x < -WIDTH/2) {
      this.coord.x = WIDTH/2
    } else if (this.coord.x > WIDTH/2) {
      this.coord.x = -WIDTH/2
    }
    if (this.coord.y < -HEIGHT/2) {
      this.coord.y = HEIGHT/2
    } else if (this.coord.y > HEIGHT/2) {
      this.coord.y = -HEIGHT/2
    }
    if (this.coord.z < -DEPTH/2) {
      this.coord.z = DEPTH/2
    } else if (this.coord.z > DEPTH/2) {
      this.coord.z = -DEPTH/2
    }
  }

  draw() {
    push()
    translate(this.coord.x, this.coord.y, this.coord.z)
    fill(this.color)
    noStroke()
    sphere(10)
    pop()
  }
}
