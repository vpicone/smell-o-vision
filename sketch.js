class Blob {
  constructor(x, y) {
    this.pos = createVector(random(width), random(height));
    this.velocity = p5.Vector.random2D().mult(random(2, 5));
    this.r = 0;
  }

  show = () => {
    const grow = setInterval(() => {
      if (this.r < 30) {
        this.r += 1;
      }
      if (this.r >= 30) {
        clearInterval(grow);
      }
    }, 100);
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
      if (this.r === 0) {
        clearInterval(shrink);
      }
    }, 100);
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
  createCanvas(240, 135);
  blobs = [new Blob(), new Blob(), new Blob()];
  fill(0, 102, 153);
  frameRate(15);
  textSize(15);
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
        sum += (200 * blob.r) / distance;
      });
      if (window.xAvg < 200) {
        if (window.yAvg > 200) {
          set(x, y, color(Math.max(sum, 100), 0, 0));
        } else {
          set(x, y, color(Math.max(sum, 100), Math.max(sum, 100), 0));
        }
      } else {
        if (window.yAvg > 200) {
          set(x, y, color(0, 0, Math.max(sum, 100)));
        } else {
          set(x, y, color(0, Math.max(sum, 100), Math.max(sum, 100)));
        }
      }
    }
  }
  updatePixels();

  blobs.forEach((blob, i) => {
    blob.update();
    if (i < window.peopleCount && blob.r < 30) {
      blob.r++;
    }
    if (i >= window.peopleCount && blob.r > 0) {
      blob.r--;
    }
  });

  fill("white");
  if (unity) {
    text(`unity: ${unity.toFixed(2)}`, 10, 30);
    text(`xAvg: ${xAvg}`, 10, 40);
    text(`yAvg: ${yAvg}`, 10, 50);
    text(`people: ${peopleCount}`, 10, 60);
    text(`framerate: ${frameRate().toFixed(2)}`, 10, 70);
  }
}
