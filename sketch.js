function setup() {
  // set width, height, and depth according to the browser
  WIDTH = windowWidth
  HEIGHT = windowHeight
  DEPTH = WIDTH + HEIGHT
  HIVE_POSITION = createVector(-WIDTH/2, -HEIGHT/2, 0)
  PREDATOR_POSITION = createVector(WIDTH/2, -HEIGHT/2, -DEPTH/2)

  // initial setup for drawing
  createCanvas(WIDTH, HEIGHT, WEBGL)
  angleMode(DEGREES)
  reset()

  // show frame rate every second in the console
  setInterval(
    function() {
      console.clear()
      console.log(
        'Fps:', Math.round(frameRate()),
        '  Bee:', currBees.length,
        '  Food:', currFoods.length,
        '  Pred:', currPredators.length)
    },
    1000
  )
}

function reset() {
  currBees = new Array()
  prevBees = new Array()
  currFoods = new Array()
  currPredators = new Array()

  for (let i = 0; i < NUM_BEES; i++) {
    currBees.push(new Bee())
  }

  for (let i = 0; i < NUM_FOODS; i++) {
    currFoods.push(new Food())
  }
}

function mousePressed() {
  reset()
}

function draw() {
  // set background color
  background(BG_COLOR)

  // draw background
  // push()
  // noStroke()
  // translate(0, 0, -DEPTH/2)
  // fill([0x0A, 0xBD, 0xA0])
  // plane(WIDTH, HEIGHT)
  // pop()
  //
  // push()
  // noStroke()
  // translate(WIDTH/2, 0, 0)
  // fill([0x0A, 0xBD, 0xA0])
  // rotateY(270)
  // plane(DEPTH, HEIGHT)
  // pop()
  //
  // push()
  // noStroke()
  // translate(-WIDTH/2, 0, 0)
  // fill([0x0A, 0xBD, 0xA0])
  // rotateY(90)
  // plane(DEPTH, HEIGHT)
  // pop()
  //
  // push()
  // noStroke()
  // translate(0, -HEIGHT/2, 0)
  // fill([0x73, 0xC0, 0xF4])
  // rotateX(270)
  // plane(WIDTH, DEPTH)
  // pop()
  //
  // push()
  // noStroke()
  // translate(0, HEIGHT/2, 0)
  // fill([0x8F, 0x4F, 0x06])
  // rotateX(90)
  // plane(WIDTH, DEPTH)
  // pop()

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

  // set light location
  ambientLight(100)
  pointLight(0xFF, 0xFF, 0xFF, -DEPTH/2, -HEIGHT/2, DEPTH/2)

  // draw
  for (let food of currFoods) {
    food.draw()
  }

  for (let bee of currBees) {
    bee.draw()
  }

  for (let predator of currPredators) {
    predator.draw()
  }

  // build octree to speed up the searching of neighbors
  let beeOctree = new Octree(new Cuboid(new p5.Vector(0, 0, 0), new p5.Vector(WIDTH/2, HEIGHT/2, DEPTH/2)), 100)
  beeOctree.build(currBees)

  // check if a bee goes back to hive
  for (let bee of currBees) {
    if (bee.position.dist(HIVE_POSITION) < CHECK_DIST) {
      if (bee.gotFood) {
        STORED_FOOD += 1
      }

      bee.gotFood = false
    }
  }

  // decrement the life of bee
  for (let bee of currBees) {
    bee.life -= 1
  }

  for (let predator of currPredators) {
    predator.life -= 1
  }

  // check if any foods are consumed
  for (let food of currFoods) {
    let searchCuboid = new Cuboid(food.position, new p5.Vector(CHECK_DIST, CHECK_DIST, CHECK_DIST))
    for (let bee of beeOctree.search(searchCuboid)) {
      if (!bee.gotFood) {
        bee.gotFood = true
        food.life -= 1
        break
      }
    }
  }

  for (let predator of currPredators) {
    let searchCuboid = new Cuboid(predator.position, new p5.Vector(CHECK_DIST, CHECK_DIST, CHECK_DIST))
    for (let bee of beeOctree.search(searchCuboid)) {
      predator.life -= 1
      if (currKillInterval >= PREDATOR_KILL_INTERVAL) {
        currKillInterval -= PREDATOR_KILL_INTERVAL
        bee.life = 0
      }
    }
  }
  currKillInterval += 1

  // remove the object with 0 life
  let removeBeeIdx = new Array()
  let removeFoodIdx = new Array()
  let removePredatorIdx = new Array()

  for (let i = 0; i < currBees.length; i++) {
    if (currBees[i].isDead()) {
      removeBeeIdx.push(i)
    }
  }

  for (let i = 0; i < currFoods.length; i++) {
    if (currFoods[i].isDead()) {
      removeFoodIdx.push(i)
    }
  }

  for (let i = 0; i < currPredators.length; i++) {
    if (currPredators[i].isDead()) {
      removePredatorIdx.push(i)
    }
  }

  removeBeeIdx.reverse()
  removeFoodIdx.reverse()
  removePredatorIdx.reverse()

  for (let i of removeBeeIdx) {
    currBees.splice(i, 1)
  }

  for (let i of removeFoodIdx) {
    currFoods.splice(i, 1)
  }

  for (let i of removePredatorIdx) {
    currPredators.splice(i, 1)
  }

  // generate new object
  for (let i = NUM_FOODS - currFoods.length; i > 0; i--) {
    if (Math.random() > FOOD_REGEN_PROB) {
      break;
    }
    currFoods.push(new Food())
  }

  for (; STORED_FOOD >= NEW_BEE_COST; currBees.push(new Bee()), STORED_FOOD -= NEW_BEE_COST)

  if (
    currPredators.length < Math.floor(currBees.length/PREDATOR_COND) &&
    currPredators.length < PREDATOR_LIMIT &&
    currRespawnInterval >= PREDATOR_RESPAWN_INTERVAL
  ) {
    for (let i = currPredators.length; i < Math.floor(currBees.length/PREDATOR_COND); i++) {
      currPredators.push(new Predator())
    }
    currRespawnInterval -= PREDATOR_RESPAWN_INTERVAL
  }
  currRespawnInterval += 1

  // deep copy
  prevBees = [...currBees].map(i => ({...i}))

  // build octree to speed up the searching of neighbors
  beeOctree = new Octree(new Cuboid(new p5.Vector(0, 0, 0), new p5.Vector(WIDTH/2, HEIGHT/2, DEPTH/2)), 100)
  beeOctree.build(prevBees)

  // update the location of each bee
  for (let bee of currBees) {
    let searchCuboid = new Cuboid(bee.position, new p5.Vector(NEIGHBOR_DIST, NEIGHBOR_DIST, NEIGHBOR_DIST))
    bee.update(beeOctree.search(searchCuboid), currFoods, currPredators)
  }

  for (let predator of currPredators) {
    let searchCuboid = new Cuboid(predator.position, new p5.Vector(NEIGHBOR_DIST, NEIGHBOR_DIST, NEIGHBOR_DIST))
    predator.update(beeOctree.search(searchCuboid))
  }

  // draw hive
  push()
  translate(HIVE_POSITION)
  fill(HIVE_COLOR)
  noStroke()
  ellipsoid(100, 200, 100)
  pop()
}
