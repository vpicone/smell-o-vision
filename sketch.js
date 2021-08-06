class Blob {
  constructor(x, y) {
    this.pos = createVector(random(width), random(height));
    this.velocity = p5.Vector.random2D().mult(random(5, 10));
    this.r = 0;
  }

  show = () => {
    const grow = setInterval(() => {
      if (this.r < 20) {
        this.r += 1;
      }
      if (this.r === 20) {
        clearInterval(grow);
      }
    }, 50);
  };

  debug = () => {
    noFill();
    stroke(0);
    strokeWeight(4);
    ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);
  };

  hide = () => {
    const shrink = setInterval(() => {
      if (this.r > 0) {
        this.r -= 1;
      }
      if (this.r <= 0) {
        clearInterval(shrink);
      }
    }, 50);
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
  colorMode(HSL);
  createCanvas(640, 360);
  blobs = [
    new Blob(),
    new Blob(),
    new Blob(),
    new Blob(),
    new Blob(),
    new Blob(),
    new Blob(),
    new Blob(),
    new Blob(),
  ];
  fill(0, 102, 153);
  textSize(32);
}

function draw() {
  const { unity, xAvg, yAvg, peopleCount } = window;
  clear();

  loadPixels();
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let sum = 0;
      blobs.forEach((blob) => {
        const distance = dist(x, y, blob.pos.x, blob.pos.y);
        sum += (100 * blob.r) / distance;
      });
      set(x, y, color(sum, 50, 50));
    }
  }
  updatePixels();

  blobs.forEach((blob, i) => {
    blob.update();
    blob.debug();
    if (i < window.peopleCount) {
      blob.show();
    } else {
      blob.hide();
    }
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
