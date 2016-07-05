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
  colony = new Colony(p.colonySize);
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
		var controller = f1.add(p, 'centerSpawn').name('Centered [C]').listen();
		  controller.onChange(function(value) {populateColony(); });

	var f2 = gui.addFolder('Colour');
	  var controller = f2.addColor(p, 'bkgColHSV').name('Background').listen();
	    controller.onChange(function(value) {p.bkgColor = color(value.h, value.s*255, value.v*255); background(p.bkgColor);});

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

	var f6 = gui.addFolder("Movement");
    var controller =f6.add(p, 'stepSize', 0, 100).name('Step (cell)').listen();
	   controller.onChange(function(value) {if (p.stepSize==0) {p.stepped=false} else {p.stepped=true};});


	var f7 = gui.addFolder("Appearance");
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
  this.bkgColor = color(0, 0, 255); // Background colour HACKED to give white background

  if (random(1) > 1) {this.fill_HTwist = floor(random(1, 360));} else {this.fill_HTwist = 0;}
  if (random(1) > 1) {this.fill_STwist = floor(random (1,255));} else {this.fill_STwist = 0;}
  if (random(1) > 1) {this.fill_BTwist = floor(random (1,255));} else {this.fill_BTwist = 0;}
  if (random(1) > 1) {this.fill_ATwist = floor(random (1,255));} else {this.fill_ATwist = 0;}
  if (random(1) > 1) {this.stroke_HTwist = floor(random(1, 360));} else {this.stroke_HTwist = 0;}
  if (random(1) > 1) {this.stroke_STwist = floor(random (1,255));} else {this.stroke_STwist = 0;}
  if (random(1) > 1) {this.stroke_BTwist = floor(random (1,255));} else {this.stroke_BTwist = 0;}
  if (random(1) > 1) {this.stroke_ATwist = floor(random (1,255));} else {this.stroke_ATwist = 0;}

  if (random(1) > 0) {this.nucleus = true;} else {this.nucleus = false;} // HACKED so always true

  this.stepSize = 0;
  this.stepSizeN = 0;
  this.stepped = false;
  this.wraparound = false;

  this.trailMode = 3; // 1=none, 2 = blend, 3 = continuous
  this.restart = function () {colony.cells = []; populateColony();};
  this.randomRestart = function () {randomizer(); colony.cells = []; populateColony();};
  this.instructions = function () {window.open("http://rik-brown.github.io/Aybe_Sea/Instructions.txt")};
  this.debug = false;

}

function randomizer() { // Parameters are randomized (more than in the initial configuration)
  p.colonySize = int(random (10,200));
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
