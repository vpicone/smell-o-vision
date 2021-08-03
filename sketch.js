class Blob {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.velocity = p5.Vector.random2D().mult(random(5, 10));
    this.r = random(20, 40);
  }

  show = () => {
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
  
  blob1 = new Blob(random(0,640), random(random(0,360)));
  blob2 = new Blob(random(0,640), random(random(0,360)));
  blob3 = new Blob(random(0,640), random(random(0,360)));
  blobs = [blob1, blob2, blob3];
  createCanvas(640, 360);
  fill(0, 102, 153);
  textSize(32);
  pixelDensity(1);
}

function draw() {
  const { unity, xAvg, yAvg, peopleCount } = window;
  clear();

  loadPixels();
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let sum = 0;
      blobs.forEach(blob => {
          const distance = dist(x, y, blob.pos.x, blob.pos.y);
          sum += 250 * blob.r * unity / distance;
      })
      colorMode(RGB, x ^ y + 220);
      set(x, y, color(sum, 150, 100));
    }
  }
  updatePixels();

  blobs.forEach((blob) => {
    blob.update();
    // blob.show();
  });

  fill("white");
  text(`framerate: ${frameRate().toFixed(2)}`, 10, 320);

  if (unity) {
    text(`unity: ${unity.toFixed(2)}`, 10, 30);
    text(`xAvg: ${xAvg}`, 10, 60);
    text(`yAvg: ${yAvg}`, 10, 90);
    text(`people: ${peopleCount}`, 10, 120);
  }
}
