// cell Class
function Cell(pos, vel, dna_) {

  //  Objects

  this.dna = dna_;

  // DNA gene mapping (15 genes)
  // 0 = fill Hue & vMax (Noise)
  // 1 = fill Saturation
  // 2 = fill Brightness & Spiral screw
  // 3 = fill Alpha
  // 4 = stroke Hue & step (Noise)
  // 5 = stroke Saturation
  // 6 = stroke Brightness & noisePercent
  // 7 = stroke Alpha
  // 8 = cellStartSize & Fertility (large size = lower fertility)
  // 9 = cellEndSize
  // 10 = lifespan & spawnCount (long lifespan = few children)
  // 11 = flatness & spiral handedness

  // BOOLEAN
  this.fertile = false; // A new cell always starts of infertile

  // GROWTH & REPRODUCTION
  this.age = 0; // Age is 'number of frames since birth'. A new cell always starts with age = 0. From age comes maturity
  this.lifespan = map(this.dna.genes[10], 0, 1, 1000, 2000); // Lifespan can be lowered by DNA but not increased
  this.fertility = map(this.dna.genes[8], 1, 0, 0.7, 0.9);
  this.spawnCount = int(map(this.dna.genes[10], 1, 0, 1, 5)); // Max. number of spawns

  // SIZE AND SHAPE
  this.cellStartSize = map(this.dna.genes[8], 0, 1, 30, 60);
  this.cellEndSize = this.cellStartSize * map(this.dna.genes[9], 0, 1, 0, 0.1);
  this.r = this.cellStartSize; // Initial value for radius
  this.flatness = map(this.dna.genes[11], 0, 1, 0.5, 2); // To make circles into ellipses. range 0.5 - 1.5
  this.growth = (this.cellStartSize-this.cellEndSize)/this.lifespan; // Should work for both large>small and small>large
  this.drawStep = 1;
  this.drawStepN = 1;

  // MOVEMENT
  this.position = pos; //cell has position
  this.velocityLinear = vel; //cell has unique basic velocity component
  this.noisePercent = this.dna.genes[6];
  this.spiral = map(this.dna.genes[2], 0, 1, 0, 2); // Spiral screw amount
  this.vMax = map(this.dna.genes[0], 0, 1, 0, 4); // Maximum magnitude in velocity components generated by noise
  this.xoff = random(1000); //Seed for noise
  this.yoff = random(1000); //Seed for noise
  this.step = map(this.dna.genes[4], 0, 1, 0.001, 0.006); //Step-size for noise

  // COLOUR

  // FILL COLOR
  this.fill_H = map(this.dna.genes[0], 0, 1, 0, 360);
  this.fill_S = map(this.dna.genes[1], 0, 1, 255, 255);
  this.fill_B = map(this.dna.genes[2], 0, 1, 255, 255);
  this.fillColor = color(this.fill_H, this.fill_S, this.fill_B); // Initial color is set
  this.fillAlpha = map(this.dna.genes[3], 0, 1, 255, 255);

  //STROKE COLOR
  this.stroke_H = map(this.dna.genes[4], 0, 1, 0, 360);
  this.stroke_S = map(this.dna.genes[5], 0, 1, 0, 255);
  this.stroke_B = map(this.dna.genes[6], 0, 1, 0, 255);
  this.strokeColor = color(this.stroke_H, this.stroke_S, this.stroke_B); // Initial color is set
  this.strokeAlpha = map(this.dna.genes[7], 0, 1, 0, 0);

  this.run = function() {
    this.live();
    this.updatePosition();
    this.updateSize();
    this.updateFertility();
    this.updateColor();
    if (p.wraparound) {this.checkBoundaryWraparound();}
    this.display();
    if (p.debug) {this.cellDebugger(); }
  }

  this.live = function() {
    this.age += 1;
    this.maturity = map(this.age, 0, this.lifespan, 1, 0);
    this.drawStep--;
    this.drawStepStart = map(p.stepSize, 0, 100, 0 , (this.r *2 + this.growth));
    if (this.drawStep < 0) {this.drawStep = this.drawStepStart;}
    this.drawStepN--;
    this.drawStepNStart = map(p.stepSizeN, 0, 100, 0 , this.r *2);
    if (this.drawStepN < 0) {this.drawStepN = this.drawStepNStart;}
  }

  this.updatePosition = function() {
    var vx = map(noise(this.xoff), 0, 1, -this.vMax, this.vMax); // get new vx value from Perlin noise function
    var vy = map(noise(this.yoff), 0, 1, -this.vMax, this.vMax); // get new vy value from Perlin noise function
    var velocityNoise = createVector(vx, vy); // create new velocity vector based on new vx, vy components
    this.xoff += this.step; // increment x offset for next vx value
    this.yoff += this.step; // increment x offset for next vy value
    this.velocity = p5.Vector.lerp(this.velocityLinear, velocityNoise, this.noisePercent);
    var screwAngle = map(this.maturity, 0, 1, 0, this.spiral * TWO_PI); //swapped size with maturity
    if (this.dna.genes[11] >= 0.5) {screwAngle *= -1;}
    this.velocity.rotate(screwAngle);
    this.position.add(this.velocity);
  }

  this.updateSize = function() {
    this.r -= this.growth;
  }

  this.updateFertility = function() {
    if (this.maturity <= this.fertility) {this.fertile = true; } else {this.fertile = false; } // A cell is fertile if maturity is within limit (a % of lifespan)
    if (this.spawnCount == 0) {this.fertility = 0;} // Once spawnCount has counted down to zero, the cell will spawn no more
  }

  this.updateColor = function() {
    if (p.fill_STwist > 0) {this.fill_S = map(this.maturity, 1, 0, (255-p.fill_STwist), 255); this.fillColor = color(this.fill_H, this.fill_S, this.fill_B);} // Modulate fill saturation by radius
    if (p.fill_BTwist > 0) {this.fill_B = map(this.maturity, 1, 0, (255-p.fill_BTwist), 255); this.fillColor = color(this.fill_H, this.fill_S, this.fill_B);} // Modulate fill brightness by radius
    if (p.fill_ATwist > 0) {this.fillAlpha = map(this.maturity, 1, 0, (255-p.fill_ATwist), 255);} // Modulate fill Alpha by radius
    if (p.fill_HTwist > 0) { // Modulate fill hue by radius. Does not change original hue value but replaces it with a 'twisted' version
      this.fill_Htwisted = map(this.maturity, 1, 0, this.fill_H, this.fill_H+p.fill_HTwist);
      if (this.fill_Htwisted > 360) {this.fill_Htwisted -= 360;}
      this.fillColor = color(this.fill_Htwisted, this.fill_S, this.fill_B); //fill colour is updated with new hue value
    }
    if (p.stroke_STwist > 0) {this.stroke_S = map(this.maturity, 1, 0, (255-p.stroke_STwist), 255); this.strokeColor = color(this.stroke_H, this.stroke_S, this.stroke_B);} // Modulate stroke saturation by radius
    if (p.stroke_BTwist > 0) {this.stroke_B = map(this.maturity, 1, 0, (255-p.stroke_BTwist), 255); this.strokeColor = color(this.stroke_H, this.stroke_S, this.stroke_B);} // Modulate stroke brightness by radius
    if (p.stroke_ATwist > 0) {this.strokeAlpha = map(this.maturity, 1, 0, (255-p.stroke_ATwist), 255);} // Modulate stroke Alpha by radius
    if (p.stroke_HTwist > 0) { // Modulate stroke hue by radius
      this.stroke_Htwisted = map(this.maturity, 1, 0, this.stroke_H, this.stroke_H+p.stroke_HTwist);
      if (this.stroke_Htwisted > 360) {this.stroke_Htwisted -= 360;}
      this.strokeColor = color(this.stroke_Htwisted, this.stroke_S, this.stroke_B); //stroke colour is updated with new hue value
    }
  }

    this.checkBoundaryWraparound = function() {
    if (this.position.x > width + this.r*this.flatness) {
      this.position.x = -this.r*this.flatness;
    } else if (this.position.x < -this.r*this.flatness) {
      this.position.x = width + this.r*this.flatness;
    } else if (this.position.y > height + this.r*this.flatness) {
      this.position.y = -this.r*this.flatness;
    } else if (this.position.y < -this.r*this.flatness) {
      this.position.y = height + this.r*this.flatness;
    }
  }

  // Death
  this.dead = function() {
    if (this.cellEndSize < this.cellStartSize && this.r <= this.cellEndSize) {return true;} // Death by size (only when cell is shrinking)
    if (this.age >= this.lifespan) {return true;} // Death by old age (regardless of size, which may remain constant)
    if (this.position.x > width + this.r*this.flatness || this.position.x < -this.r*this.flatness || this.position.y > height + this.r*this.flatness || this.position.y < -this.r*this.flatness) {return true;} // Death if move beyond canvas boundary
    else {return false; }
  };

  this.display = function() {

    stroke(hue(this.strokeColor), saturation(this.strokeColor), brightness(this.strokeColor), this.strokeAlpha);
    fill(hue(this.fillColor), saturation(this.fillColor), brightness(this.fillColor), this.fillAlpha);

    var angle = this.velocity.heading();
    push();
    translate(this.position.x, this.position.y);
    rotate(angle);
    if (!p.stepped) { // No step-counter for Cell
      ellipse(0, 0, this.r, this.r * this.flatness);
      if (p.nucleus && this.drawStepN < 1) {
        if (this.fertile) {
          fill(0); ellipse(0, 0, this.cellEndSize, this.cellEndSize * this.flatness);
        }
        else {
          fill(255); ellipse(0, 0, this.cellEndSize, this.cellEndSize * this.flatness);
        }
      }
    }
    else if (this.drawStep < 1) { // stepped=true, step-counter is active for cell, draw only when counter=0
      ellipse(0, 0, this.r, this.r*this.flatness);
      if (p.nucleus && this.drawStepN < 1) { // Nucleus is always drawn when cell is drawn (no step-counter for nucleus)
        if (this.fertile) {
          fill(0); ellipse(0, 0, this.cellEndSize, this.cellEndSize * this.flatness);
        }
        else {
          fill(255); ellipse(0, 0, this.cellEndSize, this.cellEndSize * this.flatness);
        }
      }
    }
    pop();
  };

  this.checkCollision = function(other) { // Method receives a Cell object 'other' to get the required info about the collidee
    var distVect = p5.Vector.sub(other.position, this.position); // Static vector to get distance between the cell & other
    var distMag = distVect.mag(); // calculate magnitude of the vector separating the balls
    if (distMag < (this.r + other.r)) {this.conception(other, distVect);} // Spawn a new cell
  }

  this.conception = function(other, distVect) {
    // Decrease spawn counters.
    this.spawnCount--;
    other.spawnCount--;

    //Calculate position for spawn based on PVector between cell & other (leaving 'distVect' unchanged, as it is needed later)
    var spawnPos = distVect.copy(); // Create spawnPos as a copy of the (already available) distVect which points from parent cell to other
    spawnPos.normalize();
    spawnPos.mult(this.r); // The spawn position is located at parent cell's radius
    spawnPos.add(this.position);
    // 20th June 2016 Changing spawn position to the position of the current 'mother' cell for smoother branching.
    // var spawnPos = this.position.copy();

    // Calculate velocity vector for spawn as being roughly centered between parent cell & other
    var spawnVel = this.velocity.copy(); // Create spawnVel as a copy of parent cell's velocity vector
    spawnVel.add(other.velocity); // Add dad's velocity
    spawnVel.normalize(); // Normalize to leave just the direction and magnitude of 1 (will be multiplied later)

    // Calculate new fill colour for child (a 50/50 blend of each parent cells)
    var childFillColor = lerpColor(this.fillColor, other.fillColor, 0.5);

    // Calculate new stroke colour for child (a 50/50 blend of each parent cells)
    var childStrokeColor = lerpColor(this.strokeColor, other.strokeColor, 0.5);

    // Calculate new cellStartSize for child (=average of each parent cells)
    var childStartSize = (this.cellStartSize + other.cellStartSize) * 0.5;

    // Combine the DNA of the parent cells
    var childDNA = this.dna.combine(other.dna);

    // Call spawn method (in Colony) with the new parameters for position, velocity, colour & starting radius)
    // Note: Currently no combining of parent DNA
    colony.spawn(spawnPos, spawnVel, childFillColor, childStrokeColor,childDNA, childStartSize);


    //Reduce fertility for parent cells by squaring them
    this.fertility *= this.fertility;
    this.fertile = false;
    other.fertility *= other.fertility;
    other.fertile = false;
  }

  this.cellDebugger = function() { // Displays cell parameters as text (for debug only)
    var rowHeight = 15;
    fill(0);
    textSize(rowHeight);
    // RADIUS
    //text("r:" + this.r, this.position.x, this.position.y + rowHeight*1);
    text("cellStartSize:" + this.cellStartSize, this.position.x, this.position.y + rowHeight*0);
    text("cellEndSize:" + this.cellEndSize, this.position.x, this.position.y + rowHeight*1);

    // COLOUR
    text("fill_H:" + this.fill_H, this.position.x, this.position.y + rowHeight*2);
    //text("fill_Htw:" + this.fill_Htwisted, this.position.x, this.position.y + rowHeight*5);
    //text("fill_S:" + this.fill_S, this.position.x, this.position.y + rowHeight*6);
    //text("fill_B:" + this.fill_B, this.position.x, this.position.y + rowHeight*7);
    //text("this.fillCol:" + this.fillColor, this.position.x, this.position.y + rowHeight*2);
    //text("this.fillAlpha:" + this.fillAlpha, this.position.x, this.position.y + rowHeight*3);
    //text("this.fillCol (hue):" + hue(this.fillColor), this.position.x, this.position.y + rowHeight*2);
    //text("this.strokeCol:" + this.strokeColor, this.position.x, this.position.y + rowHeight*4);
    //text("this.strokeAlpha:" + this.strokeAlpha, this.position.x, this.position.y + rowHeight*5);

    // GROWTH
    //text("growth:" + this.growth, this.position.x, this.position.y + rowHeight*5);
    //text("maturity:" + this.maturity, this.position.x, this.position.y + rowHeight*1);
    text("lifespan:" + this.lifespan, this.position.x, this.position.y + rowHeight*3);
    //text("age:" + this.age, this.position.x, this.position.y + rowHeight*3);
    text("fertility:" + this.fertility, this.position.x, this.position.y + rowHeight*4);
    //text("fertile:" + this.fertile, this.position.x, this.position.y + rowHeight*3);
    //text("spawnCount:" + this.spawnCount, this.position.x, this.position.y + rowHeight*4);

    // MOVEMENT
    //text("vel.x:" + this.velocity.x, this.position.x, this.position.y + rowHeight*4);
    //text("vel.y:" + this.velocity.y, this.position.x, this.position.y + rowHeight*5);
    //text("vel.heading():" + this.velocity.heading(), this.position.x, this.position.y + rowHeight*3);
    //text("Noise%:" + this.noisePercent, this.position.x, this.position.y + rowHeight*1);
    //text("screw amount:" + p.spiral, this.position.x, this.position.y + rowHeight*2);

    // DNA
    //text("gene [13]:" + this.dna.genes[13], this.position.x, this.position.y + rowHeight*0);
  }

}
