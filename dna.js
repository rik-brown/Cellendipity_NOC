// DNA class
// This is a copy from the original 'Nature of Code' example 'Evolution EcoSystem'
// by Daniel Shiffman <http://www.shiffman.net>
// NOTE: 'copy()' and 'mutate()' are not in use

var numGenes = 12

// Constructor (makes a random DNA with 15 genes)
function DNA(newgenes) {
  if (newgenes) {           // Tests to see if the function is called with a newgenes passed in or not:
    this.genes = newgenes;  // if it is, simply return a copy as this.genes
  } else {                  // if not, populate this.genes with 'numGenes' new genes
    // The genetic sequence
    // DNA is random floating point values between 0 and 1
    this.genes = new Array(numGenes);
    for (var i = 0; i < this.genes.length; i++) {
      this.genes[i] = random(0, 1);
    }
  }

  this.combine = function(otherDNA_) { // Returns a new set of DNA consisting of randomly selected genes from both parents
    var newgenes = []; // an empty array, ready to be populated
    for (var i = 0; i < this.genes.length; i++) { // iterate through the entire DNA
      if (random() < 0.5) {newgenes[i] = this.genes[i];} else {newgenes[i] = otherDNA_.genes[i];} // 50/50 chance of copying gene from either 'mother' or 'other'
    }
    return new DNA(newgenes); // Calls the DNA constructor and passes in the newly populated newgenes array
  }

  // Based on a mutation probability 'm', picks a new random character in array spots
  this.mutate = function(m) { 
    for (var i = 0; i < this.genes.length; i++) {
      if (random(1) < m) {
        this.genes[i] = random(0, 1);
      }
    }
  }

}
