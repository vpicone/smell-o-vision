let socket = new WebSocket("ws://localhost:8081");

const RED_PIN = 2;
const BLUE_PIN = 3;
const GREEN_PIN = 4;
const YELLOW_PIN = 5;
const [CANVAS_WIDTH, CANVAS_HEIGHT] = [300, 167];

class Blob {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.velocity = p5.Vector.random2D().mult(random(1, 3));
    this.r = 0;
  }

  debug = () => {
    noFill();
    stroke(0);
    strokeWeight(4);
    ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);
  };

  update = () => {
    if (this.pos.x > width || this.pos.x < 0) {
      this.velocity.x *= -1;
    }
    if (this.pos.y > height || this.pos.y < 0) {
      this.velocity.y *= -1;
    }
    this.pos.add(this.velocity);
  };
}

let blobs = [];

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  blobs = [new Blob(), new Blob(), new Blob()];
  fill(0, 102, 153);
  frameRate(24);
  textSize(10);
}

const setColor = (activeQuadrant) => {
  if (window.activeQuadrant !== activeQuadrant) {
    socket.send(`${activeQuadrant}!`);
    window.activeQuadrant = activeQuadrant;
  }
};

function draw() {
  const { unity, xAvg, yAvg, peopleCount } = window;
  clear();

  //   Load pixels for individual manipulation
  loadPixels();
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let sum = 0;
      blobs.forEach((blob) => {
        const distance = dist(x, y, blob.pos.x, blob.pos.y);
        sum += (200 * blob.r) / distance;
      });
      // Clockwise from projection wall left
      if (window.yAvg < 225) {
        if (window.xAvg < 400) {
          // projection wall left
          setColor(RED_PIN);
          set(x, y, color(Math.max(sum, 100), 0, 0));
        } else {
          // projection wall right
          setColor(BLUE_PIN);
          set(x, y, color(0, 0, Math.max(sum, 100)));
        }
      } else {
        if (window.xAvg > 400) {
          // entrance wall right
          setColor(GREEN_PIN);
          set(x, y, color(0, Math.max(sum, 100), 0));
        } else {
          // entrance wall left
          setColor(YELLOW_PIN);
          set(x, y, color(Math.max(sum, 100), Math.max(sum, 100), 0));
        }
      }
    }
  }
  updatePixels();

  blobs.forEach((blob, i) => {
    // Moves the blobs
    blob.update();

    // Fades blobs in and out
    if (i < window.peopleCount && blob.r < 25) {
      blob.r++;
    }
    if (i >= window.peopleCount && blob.r > 0) {
      blob.r--;
    }
  });

  // Debug helpers
  if (window.debug) {
    const video = document.getElementById("video");
    video.style.visibility = "visible";
    strokeWeight(1);
    stroke("white");
    line(0, height / 2, width, height / 2);
    line(width / 2, 0, width / 2, height);
    fill("#663399");
    // 240 135
    ellipse(
      map(window.xAvg, 0, 800, 0, CANVAS_WIDTH),
      map(window.yAvg, 0, 450, 0, CANVAS_HEIGHT),
      20
    );

    fill("white");

    if (unity) {
      text(`unity: ${unity.toFixed(2)}`, 10, 10);
      text(`xAvg: ${window.xAvg}`, 10, 20);
      text(`yAvg: ${window.yAvg}`, 10, 30);
      text(`people: ${peopleCount}`, 10, 40);
      text(`framerate: ${frameRate().toFixed(2)}`, 10, 50);
      text(`width: ${width}`, 100, 30);
      text(`height: ${height}`, 100, 40);
      text(`mappedx: ${map(window.xAvg, 0, 800, 0, CANVAS_WIDTH)}`, 100, 50);
      text(`mappedy: ${map(window.yAvg, 0, 450, 0, CANVAS_HEIGHT)}`, 100, 60);
    }
  }
}
