/* References/ Sources
https://editor.p5js.org/der_erdmann/sketches/Kej6ajBys
Based off Heat Signature By der_erdmann


https://editor.p5js.org/diodesign/sketches/RMdeeqDJs
https://www.youtube.com/watch?v=76fiD5DvzeQ
https://openprocessing.org/sketch/387974/
https://editor.p5js.org/xinxin/sketches/BrpAyJeR
*/

// TODO: re-enable socket here and in setProfile function
// const socket = new WebSocket("ws://localhost:8081");

let redProfile = {
  background: "rgba(225, 200, 69, 0.01)",
  stroke: [183, 0, 0, 0.01],
  fill: [13, 49, 44, 1],
  pin: 2,
};

let blueProfile = {
  background: "rgba(80,10,0, 0.01)",
  stroke: [44, 200, 230, 0.01],
  fill: [50, 204, 211, 1],
  pin: 3,
};

let greenProfile = {
  background: "rgba(33,33,73, 0.01)",
  stroke: [208, 233, 0, 0.01],
  fill: [255, 255, 0, 1],
  pin: 4,
};

let yellowProfile = {
  background: "rgba(199, 77, 160, 0.01)",
  stroke: [255, 215, 0, 0.01],
  fill: [243, 198, 10, 1],
  pin: 5,
};

// sets default profile on load.
let activeProfile = redProfile;
let blobs = [];

function Blob() {
  this.location = createVector(random(width), random(height));
  this.velocity = p5.Vector.random2D();
  this.velocity.setMag(20);
  this.acceleration = createVector();
  this.maxSpeed = 8;
  this.maxForce = 5;
  this.calcSpeed = 1;

  this.update = function () {
    this.location.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.acceleration.mult(0.8);
    this.calcSpeed = String(this.velocity.magSq());
  };

  this.display = function () {
    strokeWeight(map(this.calcSpeed, 5, 20, 0, 160));
    stroke(...activeProfile.stroke);
    fill(...activeProfile.fill);

    strokeCap(ROUND);
    line(
      this.location.x,
      this.location.y,
      this.location.x + this.calcSpeed,
      this.location.y + this.calcSpeed
    );
    ellipse(this.location.x, this.location.y, random(0, 500), 0);
  };

  this.edges = function () {
    if (this.location.x > width) {
      this.location.x = 0;
    } else if (this.location.x < 0) {
      this.location.x = width;
    }

    if (this.location.y > height) {
      this.location.y = 0;
    } else if (this.location.y < 0) {
      this.location.y = height;
    }
  };

  this.align = function (blobs) {
    let perceptionRadius = random(width / 2, width);
    let steering = createVector();
    let total = 0;

    for (let other of blobs) {
      let d = dist(
        this.location.x,
        this.location.y,
        other.location.x,
        other.location.y
      );
      if (other != this && d < perceptionRadius) {
        steering.add(other.velocity);
        total++;
      }
    }

    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  };

  this.separation = function (blobs) {
    let perceptionRadius = random(200, 300);
    let steering = createVector();
    let total = 0;
    for (let other of blobs) {
      let d = dist(
        this.location.x,
        this.location.y,
        other.location.x,
        other.location.y
      );
      if (other != this && d < perceptionRadius) {
        let diff = p5.Vector.sub(this.location, other.location);
        diff.div(d * d);
        steering.add(diff);
        total += 2;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  };

  this.cohesion = function (blobs) {
    let perceptionRadius = random(300, 400);
    let steering = createVector();
    let total = 0;
    for (let other of blobs) {
      let d = dist(
        this.location.x,
        this.location.y,
        other.location.x,
        other.location.y
      );
      if (other != this && d < perceptionRadius) {
        steering.add(other.location);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.sub(this.location);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  };

  this.flock = function (blobs) {
    let cohesion = this.cohesion(blobs);
    let alignment = this.align(blobs);
    let separation = this.separation(blobs);
    alignment.mult(random(25, 35));
    cohesion.mult(random(-35, -25));
    separation.mult(random(10, 12));
    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation);
  };
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  //   let now = hour();
  //can we use this to change from white to black based on hour of day?
  background(255);

  //blobs number - this is where it gets updated I eliminated need for multiplier
  for (let i = 0; i < 4; i++) {
    blobs.push(new Blob());
  }
}

function draw() {
  colorMode(RGB, 100, 100, 100, 1.5);
  background(activeProfile.background);
  checkColorProfile();

  blobs.forEach((blob, i) => {
    //   Press 's' to add a simulated person (default: 0, max: 3)
    if (i < window.peopleCount + window.simulatedPeople) {
      blob.edges();
      blob.update();
      blob.flock(blobs);
      blob.display();
    }
  });

  if (window.debug) {
    colorMode(RGB);
    textSize(32);
    document.getElementById("video").style.visibility = "visible";
    strokeWeight(10);
    stroke("#663399");
    line(0, windowHeight / 2, windowWidth, windowHeight / 2);
    line(windowWidth / 2, 0, windowWidth / 2, windowHeight);
    fill("#663399");

    ellipse(
      map(window.xAvg, 0, 400, 0, windowWidth),
      map(window.yAvg, 0, 300, 0, windowHeight),
      20
    );

    strokeWeight(1);
    if (window.unity) {
      fill("white");
      rect(0, 0, 250, 180);
      fill("#663399");
      text(`xAvg: ${window.xAvg}`, 10, 30);
      text(`yAvg: ${window.yAvg}`, 10, 60);
      text(
        `people:
  real: ${window.peopleCount}
  simulated: ${window.simulatedPeople}`,
        10,
        90
      );
    }
  }
}

function checkColorProfile() {
  const setProfile = (profile) => {
    if (window.activeProfile !== profile) {
      //   socket.send(`${profile.pin}!`);
      window.activeProfile = profile;
    }
  };

  if (window.yAvg < 225) {
    if (window.xAvg < 400) {
      // projection wall left
      setProfile(redProfile);
    } else {
      // projection wall right
      setProfile(blueProfile);
    }
  } else {
    if (window.xAvg > 400) {
      // entrance wall right
      setProfile(greenProfile);
    } else {
      // entrance wall left
      setProfile(yellowProfile);
    }
  }
}
