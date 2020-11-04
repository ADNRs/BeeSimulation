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
  setInterval(
    function() {
      console.clear()
      console.log(
        'Fps:', Math.round(frameRate()),
        '  Bee:', currBees.length,
        '  Food:', currFoods.length)
    },
    1000
  )
}

function reset() {
  currBees = new Array()
  prevBees = new Array()
  currFoods = new Array()
  prevFoods = new Array()

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

  // draw
  for (let food of currFoods) {
    food.draw()
  }

  for (let bee of currBees) {
    bee.draw()
  }

  // build octree to speed up the searching of neighbors
  let beeOctree = new Octree(new Cuboid(new p5.Vector(0, 0, 0), new p5.Vector(WIDTH/2, HEIGHT/2, DEPTH/2)), 100)
  beeOctree.build(currBees)

  // check if a bee goes back to hive
  for (let bee of currBees) {
    if (bee.position.dist(createVector(-WIDTH/2, -HEIGHT/2, -DEPTH/2)) < CHECK_DIST) {
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

  // remove bees and foods
  let removeBeeIdx = new Array()
  let removeFoodIdx = new Array()

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

  removeBeeIdx.reverse()
  removeFoodIdx.reverse()

  for (let i of removeBeeIdx) {
    currBees.splice(i, 1)
  }

  for (let i of removeFoodIdx) {
    currFoods.splice(i, 1)
  }

  // generate new bees and foods
  for (let i = NUM_FOODS - currFoods.length; i > 0; i--) {
    currFoods.push(new Food())
  }

  for (; STORED_FOOD >= NEW_BEE_COST; currBees.push(new Bee()), STORED_FOOD -= NEW_BEE_COST)

  // deep copy
  prevBees = [...currBees].map(i => ({...i}))

  // build octree to speed up the searching of neighbors
  beeOctree = new Octree(new Cuboid(new p5.Vector(0, 0, 0), new p5.Vector(WIDTH/2, HEIGHT/2, DEPTH/2)), 100)
  beeOctree.build(prevBees)

  // update the location of each bee
  for (let bee of currBees) {
    let searchCuboid = new Cuboid(bee.position, new p5.Vector(DIST, DIST, DIST))
    bee.update(beeOctree.search(searchCuboid), currFoods)
  }

  // draw cell
  push()
  translate(-WIDTH/2, -HEIGHT/2, -DEPTH/2)
  fill([0x8A, 0x2C, 0x02])
  noStroke()
  sphere(100)
  pop()
}
