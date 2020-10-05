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

// the class acts as the basic component for the node of an octree
class Cuboid {
  constructor(center, halfLength) {
    this.x = center.x
    this.y = center.y
    this.z = center.z
    this.w = halfLength.x
    this.h = halfLength.y
    this.d = halfLength.z
  }

  _isInRange(p, o, range) {
    return (o - range <= p) && (p <= o + range)
  }

  // check if a point is inside this cuboid
  isContainable(point) {
    return (
      this._isInRange(point.x, this.x, this.w) &&
      this._isInRange(point.y, this.y, this.h) &&
      this._isInRange(point.z, this.z, this.d)
    )
  }

  // check if this cuboid is overlapped with the other cuboid
  isOverlapped(other) {
    return (
      this._isInRange(other.x - other.w, this.x, this.w) ||
      this._isInRange(other.x + other.w, this.x, this.w) ||
      this._isInRange(other.y - other.h, this.y, this.h) ||
      this._isInRange(other.y + other.h, this.y, this.h) ||
      this._isInRange(other.z - other.d, this.z, this.d) ||
      this._isInRange(other.z + other.d, this.z, this.d)
    )
  }
}

// the class acts as the node for an octree
class OctreeNode {
  constructor(cuboid, maxPoints) {
    this.cuboid = cuboid
    this.maxPoints = maxPoints
    this.points = new Array()
    this.isDivided = false
    this.I    = undefined // (+, +, +)
    this.II   = undefined // (-, +, +)
    this.III  = undefined // (-, -, +)
    this.IV   = undefined // (+, -, +)
    this.V    = undefined // (+, +, -)
    this.VI   = undefined // (-, +, -)
    this.VII  = undefined // (-, -, -)
    this.VIII = undefined // (+, -, -)
  }

  _branch() {
    let V  = p5.Vector
    let x  = this.cuboid.x
    let y  = this.cuboid.y
    let z  = this.cuboid.z
    let hw = this.cuboid.w / 2
    let hh = this.cuboid.h / 2
    let hd = this.cuboid.d / 2

    this.I    = new OctreeNode(new Cuboid(new V(x + hw, y + hh, z + hd), new V(hw, hh, hd)), this.maxPoints)
    this.II   = new OctreeNode(new Cuboid(new V(x - hw, y + hh, z + hd), new V(hw, hh, hd)), this.maxPoints)
    this.III  = new OctreeNode(new Cuboid(new V(x - hw, y - hh, z + hd), new V(hw, hh, hd)), this.maxPoints)
    this.IV   = new OctreeNode(new Cuboid(new V(x + hw, y - hh, z + hd), new V(hw, hh, hd)), this.maxPoints)
    this.V    = new OctreeNode(new Cuboid(new V(x + hw, y + hh, z - hd), new V(hw, hh, hd)), this.maxPoints)
    this.VI   = new OctreeNode(new Cuboid(new V(x - hw, y + hh, z - hd), new V(hw, hh, hd)), this.maxPoints)
    this.VII  = new OctreeNode(new Cuboid(new V(x - hw, y - hh, z - hd), new V(hw, hh, hd)), this.maxPoints)
    this.VIII = new OctreeNode(new Cuboid(new V(x + hw, y - hh, z - hd), new V(hw, hh, hd)), this.maxPoints)
  }

  insert(point) {
    if (!this.cuboid.isContainable(point.position)) {
      return
    }

    if (this.points.length < this.maxPoints) {
      this.points.push(point)
    } else {
      if (!this.isDivided) {
        this._branch()
        this.isDivided = true
      }

      this.I.insert(point)
      this.II.insert(point)
      this.III.insert(point)
      this.IV.insert(point)
      this.V.insert(point)
      this.VI.insert(point)
      this.VII.insert(point)
      this.VIII.insert(point)
    }
  }

  search(searchCuboid, points) {
    if (!this.cuboid.isOverlapped(searchCuboid)) {
      return
    }

    for (let point of this.points) {
      if (searchCuboid.isContainable(point.position)) {
        points.push(point)
      }
    }

    if (this.isDivided) {
      this.I.search(searchCuboid, points)
      this.II.search(searchCuboid, points)
      this.III.search(searchCuboid, points)
      this.IV.search(searchCuboid, points)
      this.V.search(searchCuboid, points)
      this.VI.search(searchCuboid, points)
      this.VII.search(searchCuboid, points)
      this.VIII.search(searchCuboid, points)
    }
  }
}

// wrapper class of OctreeNode, provide better utility of octree
class Octree {
  constructor(cuboid, maxPoints) {
    this.root = new OctreeNode(cuboid, maxPoints || 25)
  }

  build(points) {
    for (let point of points) {
      this.root.insert(point)
    }
  }

  search(cuboid) {
    let points = new Array()
    this.root.search(cuboid, points)
    return points
  }
}
