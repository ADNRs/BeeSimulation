let WIDTH
let HEIGHT
let DEPTH

let NUM_BOIDS = 1500
let VEL_LIMIT = 10

let DIST = 100
let ANGLE = 120
let SEP_STEP = 0.1
let ALI_STEP = 0.1
let COH_STEP = 0.1

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
  background(BG_COLOR)
  ambientLight(100)
  pointLight(0xFF, 0xFF, 0xFF, -DEPTH/2, -HEIGHT/2, DEPTH/2)

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

  for (let boid of currBoids) {
    boid.draw()
  }

  prevBoids = [...currBoids].map(i => ({ ...i}))

  let octree = new Octree(new Cuboid(new p5.Vector(0, 0, 0), new p5.Vector(WIDTH/2, HEIGHT/2, DEPTH/2)), 150)
  octree.build(prevBoids)

  for (let boid of currBoids) {
    let searchCuboid = new Cuboid(boid.position, new p5.Vector(DIST, DIST, DIST))
    boid.update(octree.search(searchCuboid))
  }

  // for (let boid of currBoids) {
  //   boid.update(prevBoids)
  // }
}

class Boid {
  constructor() {
    this.position = new p5.Vector(random(-WIDTH/2, WIDTH/2), random(-HEIGHT/2, HEIGHT/2), random(-DEPTH/2, DEPTH/2))
    this.velocity = p5.Vector.random3D()
    this.velocity.setMag(VEL_LIMIT)
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
    let velocity = new p5.Vector(0, 0, 0)

    for (let neighbor of neighbors) {
      velocity.sub(p5.Vector.sub(neighbor.position, this.position))
    }

    return velocity
  }

  __align(neighbors) {
    let velocity = this.velocity.copy()

    for (let neighbor of neighbors) {
      velocity.add(neighbor.velocity)
    }
    velocity.div(neighbors.length + 1)
    velocity.sub(this.velocity)

    return velocity
  }

  __cohere(neighbors) {
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

class Cuboid {
  constructor(center, halfLength) {
    this.x = center.x
    this.y = center.y
    this.z = center.z
    this.w = halfLength.x
    this.h = halfLength.y
    this.d = halfLength.z
  }

  __isInRange(p, o, range) {
    return (o - range <= p) && (p <= o + range)
  }

  isContainable(point) {
    return (
      this.__isInRange(point.x, this.x, this.w) &&
      this.__isInRange(point.y, this.y, this.h) &&
      this.__isInRange(point.z, this.z, this.d)
    )
  }

  isOverlapped(other) {
    return (
      this.__isInRange(other.x - other.w, this.x, this.w) ||
      this.__isInRange(other.x + other.w, this.x, this.w) ||
      this.__isInRange(other.y - other.h, this.y, this.h) ||
      this.__isInRange(other.y + other.h, this.y, this.h) ||
      this.__isInRange(other.z - other.d, this.z, this.d) ||
      this.__isInRange(other.z + other.d, this.z, this.d)
    )
  }
}

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

  __branch() {
    let V = p5.Vector
    let x = this.cuboid.x
    let y = this.cuboid.y
    let z = this.cuboid.z
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

    this.isDivided = true
  }

  insert(point) {
    if (!this.cuboid.isContainable(point.position)) {
      return false
    }

    if (this.points.length < this.maxPoints) {
      this.points.push(point)
    } else {
      if (!this.isDivided) {
        this.__branch()
      }

      if (this.I.insert(point)) {
        return true
      } else if (this.II.insert(point)) {
        return true
      } else if (this.III.insert(point)) {
        return true
      } else if (this.IV.insert(point)) {
        return true
      } else if (this.V.insert(point)) {
        return true
      } else if (this.VI.insert(point)) {
        return true
      } else if (this.VII.insert(point)) {
        return true
      } else if (this.VIII.insert(point)) {
        return true
      } else {
        return false
      }
    }
  }

  search(searchCuboid, points) {
    if (!points) {
      points = new Array()
    }

    if (this.cuboid.isOverlapped(searchCuboid)) {
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
    } else {
      return
    }

    return points
  }
}

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
    return this.root.search(cuboid)
  }
}
