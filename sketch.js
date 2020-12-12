function setup() {
  // set width, height, and depth according to the browser
  WIDTH = windowWidth
  HEIGHT = windowHeight
  DEPTH = 3000
  env = new Environment()

  // initial setup for drawing
  createCanvas(WIDTH, HEIGHT, WEBGL)
  background(0)
  angleMode(DEGREES)
  env.reset()

  // show some information every second in the console
  setInterval(
    function() {
      console.clear()
      console.log('Fps:', Math.round(frameRate()))
      env.print_state()
    },
    1000
  )
}

function mousePressed() {
  // env.reset()
  if (isLooping()) {
    noLoop()
  }
  else {
    loop()
  }
}

function draw() {
  // draw background
  drawPlanes()
  drawEdges()

  // set light location
  ambientLight(100)
  pointLight(0xFF, 0xFF, 0xFF, -DEPTH/2, -HEIGHT/2, DEPTH/2)

  env.draw()
  env.update()
}

function drawPlanes() {
  // draw background
  push()
  noStroke()
  translate(0, 0, -DEPTH/2)
  fill(0)
  plane(WIDTH, HEIGHT)
  pop()

  push()
  noStroke()
  translate(WIDTH/2, 0, 0)
  fill(0)
  rotateY(270)
  plane(DEPTH, HEIGHT)
  pop()

  push()
  noStroke()
  translate(-WIDTH/2, 0, 0)
  fill(0)
  rotateY(90)
  plane(DEPTH, HEIGHT)
  pop()

  push()
  noStroke()
  translate(0, -HEIGHT/2, 0)
  fill(0)
  rotateX(270)
  plane(WIDTH, DEPTH)
  pop()

  push()
  noStroke()
  translate(0, HEIGHT/2, 0)
  fill(0)
  rotateX(90)
  plane(WIDTH, DEPTH)
  pop()
}

function drawEdges() {
  stroke([0x0A, 0xAF, 0xF1])
  strokeWeight(5)
  line(WIDTH/2, HEIGHT/2, -DEPTH/2, WIDTH/2, HEIGHT/2, DEPTH/2)
  line(WIDTH/2, -HEIGHT/2, -DEPTH/2, WIDTH/2, -HEIGHT/2, DEPTH/2)
  line(-WIDTH/2, HEIGHT/2, -DEPTH/2, -WIDTH/2, HEIGHT/2, DEPTH/2)
  line(-WIDTH/2, -HEIGHT/2, -DEPTH/2, -WIDTH/2, -HEIGHT/2, DEPTH/2)
  line(WIDTH/2, HEIGHT/2, -DEPTH/2, -WIDTH/2, HEIGHT/2, -DEPTH/2)
  line(WIDTH/2, HEIGHT/2, -DEPTH/2, WIDTH/2, -HEIGHT/2, -DEPTH/2)
  line(WIDTH/2, -HEIGHT/2, -DEPTH/2, -WIDTH/2, -HEIGHT/2, -DEPTH/2)
  line(-WIDTH/2, HEIGHT/2, -DEPTH/2, -WIDTH/2, -HEIGHT/2, -DEPTH/2)
}
