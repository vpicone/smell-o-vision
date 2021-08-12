let socket = new WebSocket("ws://localhost:8081");

const RED_PIN = 2;
const YELLOW_PIN = 3;
const GREEN_PIN = 4;
const BLUE_PIN = 5;

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
  createCanvas(300, 167);
  blobs = [new Blob(), new Blob(), new Blob()];
  fill(0, 102, 153);
  frameRate(24);
  textSize(10);
}

const setColor = (activeQuadrant) => {
  if (window.activeQuadrant !== activeQuadrant) {
    console.log(activeQuadrant);
    socket.send(activeQuadrant);
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
      if (window.xAvg < 200) {
        if (window.yAvg > 200) {
          setColor(RED_PIN);
          set(x, y, color(Math.max(sum, 100), 0, 0));
        } else {
          setColor(YELLOW_PIN);
          set(x, y, color(Math.max(sum, 100), Math.max(sum, 100), 0));
        }
      } else {
        if (window.yAvg > 200) {
          setColor(BLUE_PIN);
          set(x, y, color(0, 0, Math.max(sum, 100)));
        } else {
          setColor(GREEN_PIN);
          set(x, y, color(0, Math.max(sum, 100), 0));
        }
      }
    }
  }
  updatePixels();

  blobs.forEach((blob, i) => {
    // Moves the blobs
    blob.update();

    // Fades blobs in and out
    if (i < window.peopleCount && blob.r < 30) {
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
    fill("red");
    // 240 135
    ellipse(window.xAvg, window.yAvg, 20);

    fill("white");

    // ellipse(xAvg, yAvg, 10);

    if (unity) {
      text(`unity: ${unity.toFixed(2)}`, 10, 10);
      text(`xAvg: ${xAvg}`, 10, 20);
      text(`yAvg: ${yAvg}`, 10, 30);
      text(`width: ${map(window.xAvg, 0, width, 0, 240)}`, 100, 30);
      text(`height: ${map(window.yAvg, 0, height, 0, 135)}`, 100, 40);
      text(`people: ${peopleCount}`, 10, 40);
      text(`framerate: ${frameRate().toFixed(2)}`, 10, 50);
    }
  }
}
