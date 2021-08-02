class Blob {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.velocity = p5.Vector.random2D().mult(random(5, 10));
    console.log(this.velocity)
    this.r = random(20,40);
  }

  show = () => {
    noFill();
    stroke(0);
    strokeWeight(4);
    ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);
  };

  update = () => {
    if (this.pos.x > width || this.pos.x < 0) {
      this.velocity.x = this.velocity.x * -1;
    }
    if (this.pos.y > height || this.pos.y < 0) {
        this.velocity.y = this.velocity.y * -1;
    }
    this.pos.add(this.velocity);
  };
}

let blob;
let d;

function setup() {
  blob = new Blob(100, 100);
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
      const distance = dist(x, y, blob.pos.x, blob.pos.y);
      const col = color((1000 * blob.r) / distance);
      set(x, y, col);
    }
  }
  updatePixels();

  blob.update();
  blob.show();

  fill('red');
  text(`framerate: ${frameRate().toFixed(2)}`,10,320);

  if(unity){
      text(`unity: ${(1 - (unity / 230400)).toFixed(2)}`, 10, 30);
      text(`xAvg: ${xAvg}`, 10, 60);
      text(`yAvg: ${yAvg}`, 10, 90);
      text(`people: ${peopleCount}`, 10, 120);
  }
}
