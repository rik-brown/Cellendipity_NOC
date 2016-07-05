/*
 * Cellendipity NOC
 * Kadenze 'Nature of Code' course
 * by Richard Brown
 * Assignment 05 : Genetic Algorithms
  */

var colony; // A colony object

function setup() {
  colorMode(HSB, 360, 255, 255, 255);
  createCanvas(windowWidth, windowHeight);
  smooth();
  ellipseMode(RADIUS);
  p = new Parameters();
  gui = new dat.GUI();
  //gui.remember(p); // Comment this out to disable saving presets
  initGUI();
  background(p.bkgColor);
  if (p.debug) {frameRate(10);}
  colony = new Colony(p.colonySize, p.cellStartSize);
}

function draw() {
  if (p.trailMode == 1 || p.debug) {background(p.bkgColor);}
  if (p.trailMode == 2) {trails();}
  if (!p.paused) {colony.run();}
  if (p.paused && mouseIsPressed) {colony.run();}
  if (p.paused && keyIsPressed) {colony.run();}
  if (colony.cells.length === 0) { if (keyIsPressed || p.autoRestart) {populateColony(); } } // Repopulate the colony when all the cells have died
}

function populateColony() {
  background(p.bkgColor); // Refresh the background
  colony.cells = [];
  if (p.randomize) {randomizer();}
  colony = new Colony(p.colonySize, p.cellStartSize);
}

function trails() { // Neat trick to create smooth, long trails
  blendMode(DIFFERENCE);
  noStroke();
  fill(1);
  rect(-1, -1, width + 1, height + 1);
  blendMode(BLEND);
  fill(255);
}

function mousePressed() {
  var mousePos = createVector(mouseX, mouseY);
  var vel = p5.Vector.random2D();
  if (mousePos.x < (width-270)) {colony.spawn(mousePos, vel, p.fillColor, p.strokeColor, p.cellStartSize);}
}

function mouseDragged() {
  var mousePos = createVector(mouseX, mouseY);
  var vel = p5.Vector.random2D();
  if (mousePos.x < (width-270)) {colony.spawn(mousePos, vel, p.fillColor, p.strokeColor, p.cellStartSize);}
}

function screenDump() {
  saveCanvas('screendump.png', 'png');
}

function updateHSV(fillH, strokeH) {
  p.fillColHSV = { h: fillH, s: 1, v: 1 };
  p.fillColor = color(p.fillColHSV.h, p.fillColHSV.s*255, p.fillColHSV.v*255);
  p.strokeColHSV = { h: strokeH, s: 1, v: 1 };
  p.strokeColor = color(p.strokeColHSV.h, p.strokeColHSV.s*255, p.strokeColHSV.v*255);
}


function keyTyped() {
  if (key === '1') {updateHSV(  0,   0); } // fillColor = RED
  if (key === '2') {updateHSV( 60,  60); } // fillColor = YELLOW
  if (key === '3') {updateHSV(120, 120); } // fillColor = GREEN
  if (key === '4') {updateHSV(180, 180); } // fillColor = CYAN
  if (key === '5') {updateHSV(240, 240); } // fillColor = BLUE
  if (key === '6') {updateHSV(300, 300); } // fillColor = VIOLET
  if (key === '7') { // fillColor = WHITE
      p.fillColHSV = { h: 0, s: 0, v: 1 };
      p.fillColor = color(p.fillColHSV.h, p.fillColHSV.s*255, p.fillColHSV.v*255);
      p.strokeColHSV = { h: 0, s: 0, v: 1 };
      p.strokeColor = color(p.strokeColHSV.h, p.strokeColHSV.s*255, p.strokeColHSV.v*255);
  }
  if (key === '8') { // fillColor = BLACK
    p.fillColHSV = { h: 0, s: 0, v: 0 };
    p.fillColor = color(p.fillColHSV.h, p.fillColHSV.s*255, p.fillColHSV.v*255);
    p.strokeColHSV = { h: 0, s: 0, v: 0 };
    p.strokeColor = color(p.strokeColHSV.h, p.strokeColHSV.s*255, p.strokeColHSV.v*255);
  }
  if (key === '9') { // fillColor increase Hue
    p.fillColHSV.h += 2; //
    if (p.fillColHSV.h > 360) {p.fillColHSV.h = 0;}
    p.fillColor = color(p.fillColHSV.h, p.fillColHSV.s*255, p.fillColHSV.v*255);
  }
  if (key === '0') { // fillColor decrease Hue
    p.fillColHSV.h -= 2; //
    if (p.fillColHSV.h < 0) {p.fillColHSV.h = 360;}
    p.fillColor = color(p.fillColHSV.h, p.fillColHSV.s*255, p.fillColHSV.v*255);
  }

  if (key === ' ') { //spacebar respawns with current settings
    colony.cells = [];
  }

  if (key === 'p') { // P toggles 'paused' mode
    p.paused = !p.paused;
  }

  if (key === 'c') { // C toggles 'centered' mode
    p.centerSpawn = !p.centerSpawn;
  }

  if (key === 'd') { // D toggles 'cell debug' mode
    p.debug = !p.debug;
  }

  if (key === 'n') { // N toggles 'show nucleus' mode
    p.nucleus = !p.nucleus;
  }

  if (key === 's') { // S saves a screenshot
    screenDump();
  }

  if (key === 'r') { // R for Randomize
    randomizer();
    colony.cells = [];
  }

}

var initGUI = function () {

	var f1 = gui.addFolder('Colony');
		var controller = f1.add(p, 'colonySize', 1, 200).step(1).name('Size').listen();
		  controller.onChange(function(value) {populateColony(); });
		var controller = f1.add(p, 'variance', 0, 100).step(1).name('Diversity').listen();
      controller.onChange(function(value) {populateColony(); });
		var controller = f1.add(p, 'centerSpawn').name('Centered [C]').listen();
		  controller.onChange(function(value) {populateColony(); });

	var f2 = gui.addFolder('Colour');
	  var controller = f2.addColor(p, 'bkgColHSV').name('Background').listen();
	    controller.onChange(function(value) {p.bkgColor = color(value.h, value.s*255, value.v*255); background(p.bkgColor);});
	  var controller = f2.addColor(p, 'fillColHSV').name('Cell').listen();
      controller.onChange(function(value) {p.fillColor = color(value.h, value.s*255, value.v*255);});
    f2.add(p, 'fillAlpha', 0, 255).name('Transparency').listen();
    var controller = f2.addColor(p, 'strokeColHSV').name('Membrane').listen();
	    controller.onChange(function(value) {p.strokeColor = color(value.h, value.s*255, value.v*255);});
	  f2.add(p, 'strokeAlpha', 0, 255).name('Transparency').listen();

	var f3 = gui.addFolder("Cell Tweaks");
	  f3.add(p, 'fill_HTwist', 0, 360).step(1).name('Hue').listen();
    f3.add(p, 'fill_STwist', 0, 255).name('Saturation').listen();
    f3.add(p, 'fill_BTwist', 0, 255).name('Brightness').listen();
    f3.add(p, 'fill_ATwist', 0, 255).name('Alpha.').listen();

  var f4 = gui.addFolder("Membrane Tweaks");
  	  f4.add(p, 'stroke_HTwist', 0, 360).step(1).name('Hue').listen();
      f4.add(p, 'stroke_STwist', 0, 255).name('Saturation').listen();
      f4.add(p, 'stroke_BTwist', 0, 255).name('Brightness').listen();
      f4.add(p, 'stroke_ATwist', 0, 255).name('Alpha').listen();

	var f5 = gui.addFolder("Growth");
		var controller = f5.add(p, 'cellStartSize', 0, 200).step(1).name('Size (start)').listen();
		  controller.onChange(function(value) {populateColony();});
		var controller = f5.add(p, 'cellEndSize', 0, 50).step(0.5).name('Size (end)').listen();
		  controller.onChange(function(value) {populateColony(); });
		var controller = f5.add(p, 'lifespan', 100, 2000).step(10).name('Lifespan').listen();
		  controller.onChange(function(value) {populateColony(); });
		var controller = f5.add(p, 'fertileStart', 0, 100).step(1).name('Fertility%').listen();
		  controller.onChange(function(value) {populateColony();});
		f5.add(p, 'spawnLimit', 0, 10).step(1).name('#Children');
    f5.add(p, 'growing').name('Cells grow');

	var f6 = gui.addFolder("Movement");
    f6.add(p, 'noisePercent', 0, 100).step(1).name('Noise%').listen();
	  f6.add(p, 'spiral', 0, 3).name('Spirals').listen();
	  var controller =f6.add(p, 'stepSize', 0, 100).name('Step (cell)').listen();
	   controller.onChange(function(value) {if (p.stepSize==0) {p.stepped=false} else {p.stepped=true};});


	var f7 = gui.addFolder("Appearance");
    f7.add(p, 'flatness', 0, 100).name('Flatness%').listen();
    f7.add(p, 'nucleus').name('Nucleus [N]').listen();
    f7.add(p, 'stepSizeN', 0, 100).name('Step (nucleus)').listen();

  var f8 = gui.addFolder("Options");
    var controller = f8.add(p, 'wraparound').name('Wraparound');
      controller.onChange(function(value) {populateColony();});
    f8.add(p, 'trailMode', { None: 1, Blend: 2, Continuous: 3} ).name('Trail Mode');
    f8.add(p, 'paused').name('Pause [P]').listen();
    f8.add(p, 'autoRestart').name('Auto-restart');
    f8.add(p, 'randomize').name('Randomize on restart');

  gui.add(p, 'restart').name('Respawn [space]');
  gui.add(p, 'randomRestart').name('Randomize [R]');
  gui.add(p, 'instructions').name('Instructions');
  gui.close();
}

var Parameters = function () { //These are the initial values, not the randomised ones
  this.colonySize = int(random (100,100)); // Max number of cells in the colony
  this.centerSpawn = false; // true=initial spawn is width/2, height/2 false=random
  this.autoRestart = false; // If true, will not wait for keypress before starting anew
  this.paused = false; // If true, draw will not advance unless mouseIsPressed
  this.randomize = false; // If true, parameters will be randomized on restart

  this.bkgColHSV = { h: random(360), s: random(128, 255), v: random(128, 255) }; // HACKED so always above 128
  this.bkgColor = color(this.bkgColHSV.h, this.bkgColHSV.s*255, this.bkgColHSV.v*255); // Background colour
  this.fillColHSV = { h: random(360), s: random(), v: random() };
  this.fillColor = color(this.fillColHSV.h, this.fillColHSV.s*255, this.fillColHSV.v*255); // Cell colour
  this.fillAlpha = random(255);
  this.strokeColHSV = { h: random(360), s: random(128, 255), v: random(128, 255) }; // HACKED so always above 128
  this.strokeColor = color(this.strokeColHSV.h, this.strokeColHSV.s*255, this.strokeColHSV.v*255); // Cell colour
  this.strokeAlpha = random(255);

  this.variance = 100; // Degree of influence from DNA over respective parameters. 0 = no influence from DNA, values are taken direct from GUI, all cells are similar // HACKED so always 100

  if (random(1) > 0.8) {this.fill_HTwist = floor(random(1, 360));} else {this.fill_HTwist = 0;}
  if (random(1) > 0.7) {this.fill_STwist = floor(random (1,255));} else {this.fill_STwist = 0;}
  if (random(1) > 0.8) {this.fill_BTwist = floor(random (1,255));} else {this.fill_BTwist = 0;}
  if (random(1) > 0.9) {this.fill_ATwist = floor(random (1,255));} else {this.fill_ATwist = 0;}
  if (random(1) > 0.8) {this.stroke_HTwist = floor(random(1, 360));} else {this.stroke_HTwist = 0;}
  if (random(1) > 0.7) {this.stroke_STwist = floor(random (1,255));} else {this.stroke_STwist = 0;}
  if (random(1) > 0.8) {this.stroke_BTwist = floor(random (1,255));} else {this.stroke_BTwist = 0;}
  if (random(1) > 0.9) {this.stroke_ATwist = floor(random (1,255));} else {this.stroke_ATwist = 0;}

  this.cellStartSize = random(30, 30); // Cell radius at spawn // HACKED so always 30
  this.cellEndSize = random(3, 3); // HACKED so always 3
  this.lifespan = int(random (1000, 1000)); // Max lifespan in #frames HACKED so always 1000
  this.fertileStart = int(random(80,80)); // HACKED so always 80
  this.spawnLimit = int(random(10));
  this.flatness = random(0, 50); // Amount of flatness (from circle to ellipse)
  if (random(1) > 0) {this.nucleus = true;} else {this.nucleus = false;} // HACKED so always true

  this.noisePercent = random(100); // Percentage of velocity coming from noise-calculation
  this.spiral = random(2); // Number of full (TWO_PI) rotations the velocity heading will turn through during lifespan
  this.stepSize = 0;
  this.stepSizeN = 0;
  this.stepped = false;
  this.wraparound = false;

  this.growing = true;
  this.trailMode = 1; // 1=none, 2 = blend, 3 = continuous
  this.restart = function () {colony.cells = []; populateColony();};
  this.randomRestart = function () {randomizer(); colony.cells = []; populateColony();};
  this.instructions = function () {window.open("http://rik-brown.github.io/Aybe_Sea/Instructions.txt")};
  this.debug = false;

}

function randomizer() { // Parameters are randomized (more than in the initial configuration)
  //p.colonySize = int(random (2,30));
  //if (random(1) > 0.4) {p.centerSpawn = true;} else {p.centerSpawn = false;}

  p.bkgColHSV = { h: random(360), s: random(), v: random() };
  p.bkgColor = color(p.bkgColHSV.h, p.bkgColHSV.s*255, p.bkgColHSV.v*255);
  p.fillColHSV = { h: random(360), s: random(), v: random() };
  p.fillColor = color(p.fillColHSV.h, p.fillColHSV.s*255, p.fillColHSV.v*255);
  p.strokeColHSV = { h: random(360), s: random(), v: random() };
  p.strokeColor = color(p.strokeColHSV.h, p.strokeColHSV.s*255, p.strokeColHSV.v*255);
  p.fillAlpha = random(255);
  p.strokeAlpha = random(255);

  //p.variance = random(100);

  if (random(1) > 0.5) {this.fill_HTwist = floor(random(1, 360));} else {this.fill_HTwist = 0;}
  if (random(1) > 0.5) {this.fill_STwist = floor(random (1,255));} else {this.fill_STwist = 0;}
  if (random(1) > 0.5) {this.fill_BTwist = floor(random (1,255));} else {this.fill_BTwist = 0;}
  if (random(1) > 0.5) {this.fill_ATwist = floor(random (1,255));} else {this.fill_ATwist = 0;}
  if (random(1) > 0.5) {this.stroke_HTwist = floor(random(1, 360));} else {this.stroke_HTwist = 0;}
  if (random(1) > 0.5) {this.stroke_STwist = floor(random (1,255));} else {this.stroke_STwist = 0;}
  if (random(1) > 0.5) {this.stroke_BTwist = floor(random (1,255));} else {this.stroke_BTwist = 0;}
  if (random(1) > 0.5) {this.stroke_ATwist = floor(random (1,255));} else {this.stroke_ATwist = 0;}

  p.cellStartSize = random(25,50);
  p.cellEndSize = random(0, 20);
  p.lifespan = int(random (100, 3000));
  p.fertileStart = int(random(95));
  p.spawnLimit = int(random(10));
  p.flatness = random(100);
  if (random(1) > 0.7) {p.nucleus = true;} else {p.nucleus = false;}

  p.noisePercent = random(100); // Percentage of velocity coming from noise-calculation
  p.spiral = random(3); // Number of full (TWO_PI) rotations the velocity heading will turn through during lifespan
  //if (random(1) < 0.7) {p.stepSize = 0;} else {p.stepSize = random(100)};
  //if (p.stepSize==0) {p.stepped=false} else {p.stepped=true}
  p.stepSizeN = random(20);
}

function randomizeCellColor() { // Cell fill- and stroke- color parameters are randomized
  p.fillColHSV = { h: random(360), s: random(), v: random() };
  p.fillColor = color(p.fillColHSV.h, p.fillColHSV.s*255, p.fillColHSV.v*255);
  p.strokeColHSV = { h: random(360), s: random(), v: random() };
  p.strokeColor = color(p.strokeColHSV.h, p.strokeColHSV.s*255, p.strokeColHSV.v*255);
  p.fillAlpha = random(255);
  p.strokeAlpha = random(255);
}
