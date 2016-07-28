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
  //createCanvas(1024, 1024);
  ellipseMode(RADIUS);
  p = new Parameters();
  gui = new dat.GUI();
  initGUI();
  background(p.bkgColor);
  if (p.debug) {frameRate(10);}
  colony = new Colony(p.colonySize);
}

function draw() {
  if (p.trailMode == 1 || p.debug) {background(p.bkgColor);}
  if (p.trailMode == 2) {trails();}
  colony.run();
  if (colony.cells.length === 0) { if (keyIsPressed || p.autoRestart) {populateColony(); } } // Repopulate the colony when all the cells have died
}

function populateColony() {
  background(p.bkgColor); // Refresh the background
  colony.cells = [];
  colony = new Colony(p.colonySize);
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
  var dna = new DNA();
  if (mousePos.x < (width-270)) {colony.spawn(mousePos, vel, dna);}
}

function mouseDragged() {
  var mousePos = createVector(mouseX, mouseY);
  var vel = p5.Vector.random2D();
  var dna = new DNA();
  if (mousePos.x < (width-270)) {colony.spawn(mousePos, vel, dna);}
}

function screenDump() {
  saveCanvas('screendump.png', 'png');
}

function keyTyped() {
  if (key === '1') { // '1' sets trailMode = 1 (None)
    p.trailMode = 1;
  }

  if (key === '2') { // '2' sets trailMode = 2 (Blended)
    p.trailMode = 2;
  }

  if (key === '3') { // '3' sets trailMode = 3 (Continuous)
    p.trailMode = 3;
  }


  if (key === ' ') { //spacebar respawns with current settings
    colony.cells = [];
  }

  if (key === 'c') { // C toggles 'centered' mode
    p.centerSpawn = !p.centerSpawn;
    colony.cells = [];
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
	// var controller = gui.add(p, 'colonySize', 1, 200).step(1).name('Colony Size').listen();
	//   controller.onChange(function(value) {populateColony(); });
  var controller = gui.add(p, 'numStrains', 1, 10).step(1).name('Strains').listen();
	  controller.onChange(function(value) {populateColony(); });
  var controller = gui.add(p, 'strainSize', 1, 20).step(1).name('Cells in Strain').listen();
    controller.onChange(function(value) {populateColony(); });
  var controller = gui.add(p, 'centerSpawn').name('Centered [C]').listen();
	  controller.onChange(function(value) {populateColony(); });
  var controller = gui.add(p, 'wraparound').name('Wraparound');
    controller.onChange(function(value) {populateColony();});

  var controller = gui.addColor(p, 'bkgColHSV').name('Background color').listen();
    controller.onChange(function(value) {p.bkgColor = color(value.h, value.s*255, value.v*255); background(p.bkgColor);});

	var f3 = gui.addFolder("Fill Color Tweaks");
	  f3.add(p, 'fill_HTwist', 0, 360).step(1).name('Hue').listen();
    f3.add(p, 'fill_STwist', 0, 255).name('Saturation').listen();
    f3.add(p, 'fill_BTwist', 0, 255).name('Brightness').listen();
    f3.add(p, 'fill_ATwist', 0, 255).name('Alpha.').listen();
    f3.add(p, 'fillDisable').name('Fill OFF');

  var f4 = gui.addFolder("Stroke Color Tweaks");
  	  f4.add(p, 'stroke_HTwist', 0, 360).step(1).name('Hue').listen();
      f4.add(p, 'stroke_STwist', 0, 255).name('Saturation').listen();
      f4.add(p, 'stroke_BTwist', 0, 255).name('Brightness').listen();
      f4.add(p, 'stroke_ATwist', 0, 255).name('Alpha').listen();
      f4.add(p, 'strokeDisable').name('Stroke OFF');

  var controller =gui.add(p, 'stepSize', 0, 100).name('Step Size').listen();
   controller.onChange(function(value) {if (p.stepSize==0) {p.stepped=false} else {p.stepped=true; p.trailMode = 3;};});

	var f7 = gui.addFolder("Nucleus");
    f7.add(p, 'nucleus').name('Nucleus [N]').listen();
    f7.add(p, 'stepSizeN', 0, 100).name('Step (nucleus)').listen();


  gui.add(p, 'trailMode', { None: 1, Blend: 2, Continuous: 3} ).name('Trail Mode [1-2-3]');
  gui.add(p, 'restart').name('Respawn [space]');
  gui.add(p, 'randomRestart').name('Randomize [R]');
  gui.add(p, 'autoRestart').name('Auto-restart');

  gui.close();
}

var Parameters = function () { //These are the initial values, not the randomised ones
  this.colonySize = int(random (20,80)); // Max number of cells in the colony
  this.strainSize = int(random(1,10)); // Number of cells in a strain
  this.numStrains = int(random(1,10)); // Number of strains (a group of cells sharing the same DNA)

  this.centerSpawn = false; // true=initial spawn is width/2, height/2 false=random
  this.autoRestart = false; // If true, will not wait for keypress before starting anew

  this.bkgColHSV = { h: random(360), s: random(255), v: random(255) };
  this.bkgColor = color(this.bkgColHSV.h, this.bkgColHSV.s*255, this.bkgColHSV.v*255); // Background colour

  this.fill_HTwist = 0;
  this.fill_STwist = 255;
  this.fill_BTwist = 128;
  this.fill_ATwist = 255;
  this.stroke_HTwist = 0;
  this.stroke_STwist = 255;
  this.stroke_BTwist = 128;
  this.stroke_ATwist = 255;

  this.fillDisable = false;
  this.strokeDisable = false;

  this.nucleus = false;

  this.stepSize = 0;
  this.stepSizeN = 00;
  this.stepped = false;

  this.wraparound = true;
  this.trailMode = 3; // 1=none, 2 = blend, 3 = continuous

  this.restart = function () {colony.cells = []; populateColony();};
  this.randomRestart = function () {randomizer(); colony.cells = []; populateColony();};
  this.debug = false;

}

function randomizer() { // Parameters are randomized (more than in the initial configuration)
  //p.colonySize = int(random (10,200));
  if (random(1) > 0.4) {p.centerSpawn = true;} else {p.centerSpawn = false;}

  p.bkgColHSV = { h: random(360), s: random(), v: random() };
  p.bkgColor = color(p.bkgColHSV.h, p.bkgColHSV.s*255, p.bkgColHSV.v*255);

  if (random(1) > 0.5) {this.fill_HTwist = floor(random(1, 360));} else {this.fill_HTwist = 0;}
  if (random(1) > 0.5) {this.fill_STwist = floor(random (1,255));} else {this.fill_STwist = 0;}
  if (random(1) > 0.5) {this.fill_BTwist = floor(random (1,255));} else {this.fill_BTwist = 0;}
  if (random(1) > 0.5) {this.fill_ATwist = floor(random (1,255));} else {this.fill_ATwist = 0;}
  if (random(1) > 0.5) {this.stroke_HTwist = floor(random(1, 360));} else {this.stroke_HTwist = 0;}
  if (random(1) > 0.5) {this.stroke_STwist = floor(random (1,255));} else {this.stroke_STwist = 0;}
  if (random(1) > 0.5) {this.stroke_BTwist = floor(random (1,255));} else {this.stroke_BTwist = 0;}
  if (random(1) > 0.5) {this.stroke_ATwist = floor(random (1,255));} else {this.stroke_ATwist = 0;}

  if (random(1) > 0.7) {p.nucleus = true;} else {p.nucleus = false;}

  if (random(1) < 0.7) {p.stepSize = 0;} else {p.stepSize = random(100)};
  if (p.stepSize==0) {p.stepped=false} else {p.stepped=true}
  p.stepSizeN = random(20);
}
