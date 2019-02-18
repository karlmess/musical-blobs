//--------------------------------------------------//
//--------Interactive musical jiggly shapes---------//
//--------------------------------------------------//
//-------------Just click on a circle.--------------//
//--------------------------------------------------//
//----------Notes are dependent on color------------//
//----------No weird dissonances, promise!----------//
//--------------------------------------------------//


    //-----------------------------------------//
   //-------------ELEMENT OBJECT--------------//
  //-----------------------------------------//
 //---------Code for a single circle--------//
//-----------------------------------------//

function Element(x,y){
  this.i=x;                     //--- Array indices for the location of the element,
  this.j=y;                     //--- are used to trigger sound and animation functions
  this.size = elementSize;      // Exactly what you think it would be
  this.rate = random(1,5);      // rate at which the element jiggles
  this.intensity = random(1,5); // how much it jiggles, in terms of change in radius
  this.touch = false;           // whether the element if being touched by the mouse
  this.bright = 63;             // default brightness value

  // ----- Set up oscillator
  this.osc = new p5.Oscillator();   // Create a new oscillator
  this.ampEnv = new p5.Env();       // Creates an amplitude envelope to apply
  this.ampEnv.setADSR(0.5,2,0,5);   // ADSR settings
  this.osc.amp(this.ampEnv);        // Applies the amplitude envelope to the oscillator
  
  //----- Draw the actual element -----//
  this.blob = function(xPos, yPos){
    
    // Center for each blob, passed from arguments
    this.xPos=xPos;
    this.yPos=yPos;
    
    // Sets the pitch to send to the oscillator - determined by mapping position to 
    // the scale, basically correlates with color.
    this.pitch = round((map(this.xPos*this.yPos, 0,windowWidth*windowHeight, 0,5)));
    this.osc.freq(cMajor[this.pitch]);
    
    // Coloring - determined by position
    this.fillColor=round((map(this.xPos*this.yPos, 0,windowWidth*windowHeight, 0,360)));
    colorMode(HSB);
    fill(this.fillColor,31,this.bright);
    
    // Draw the ellipse
    ellipse(this.xPos, this.yPos, this.size-this.intensity*cos(frameCount/(this.rate*PI)),this.size-this.intensity*sin(frameCount/(this.rate*PI)));
  }
  
   //----- Collision listener -----//
  //------ Called in draw() ------//
  this.collide = function(){
    
    // If the mouse cursor is on that circle, tell the system it is being touched
    // and update the sound trigger to point to its origin.
    if(collidePointCircle(mouseX,mouseY, this.xPos, this.yPos, this.size)){
      this.touch = true;
      soundTriggerX = this.i;
      soundTriggerY = this.j;
    }
    // Otherwise, announce it is not being touched.  Sound triggers will be
    // updated by the next element to be touched.
    else{
      this.touch = false;
    }
    
    // If it's being touched AND clicked on, trigger the animation.  Sound triggers
    // from mousePressed() to prevent re-triggering of the oscillator if the button 
    // is held.  Animation triggers here so that it plays for as long as the button 
    // is held.
    if(this.touch && mouseIsPressed){
      
      //adjacencyBrightness(2, soundTriggerX, soundTriggerY);
      adjacencyBrightness(1, soundTriggerX, soundTriggerY);
      adjacencySize(1, soundTriggerX, soundTriggerY);
      this.bright = 255;
    }
    // When the mouse is let go or if the mouse moves to another element, stop the animation.
    else{
      this.bright = 60;
      this.size = elementSize;
    }
  }
  
}

  //-----------------------------------------//
 //----------------MAIN BODY----------------//
//----------------------------------------//

// Sets the fundamentals of the C Major scale as an array
var cMajor = [261.63, 293.66, 329.63, 392, 440, 523.25];

var element;                                // Will become a 2-D array of Element objects
var elementSize = 50;                       // Default size of the circles
var xElements;                              // How many elements along the x-axis
var yElements;                              // and how many along the y-axis
var soundTriggerX = 0, soundTriggerY = 0;   // Holds the array indices of the object whose sound will play
                                            // when the mouse is pressed - passed from Element.i and Element.j
                                            // via Element.collide()

// ----- Triggers the sound to play when the mouse is pressed ----- //

function mousePressed(){
  element[soundTriggerX][soundTriggerY].osc.start();
  element[soundTriggerX][soundTriggerY].ampEnv.play();
}

function setup() {
  createCanvas(windowWidth,windowHeight);
  
  // ----- Calculates how many elements will fit on the canvas ----- //
  
  xElements = ceil(windowWidth/elementSize);
  yElements = ceil(windowHeight/elementSize);
  
  // -- IMPORTANT:  Array must go one element beyond each canvas boundary -
  // -- in other words, leftmost point -1, rightmost point +1, top -1, bottom +1 -
  // -- Hence, each dimension of the array creates number of elements +2
  // -- This is to avoid an out of bounds error in animation if boundary elements
  // -- are clicked.
  
  // Initialize 2-D array
  element = new Array(xElements+2);
  for(var i=0;i<=xElements+2;i++){
    element[i] = new Array(yElements+2);
  }
  
  // Create elements
  for(i=0;i<=xElements+2;i++){
    for(var j=0;j<=yElements+2;j++){
      element[i][j]=new Element(i,j);
    }
  }
}

function draw() {
  background(31);
  noStroke();
  
  // Draw elements and listen for collision
  for(var i=0;i<=xElements+2;i++){
    for(var j=0;j<=yElements+2;j++){
      element[i][j].blob((i-1)*elementSize, (j-1)*elementSize);
      element[i][j].collide();
    }
  }
}

  //-----------------------------------------//
 //-------------- ANIMATION ----------------//
//-----------------------------------------//

// Brightens the surrounding elements while the mouse is pressed
// Called by Elements.collide()
// degree determines how many levels of adjacency are brightened -
// Ex. degree=1 means all 8 directly adjacent elements are brightened,
// degree=2 means adjacent and adjacent to adjacent are brighteded, etc.
function adjacencyBrightness(degree,x,y){
  for(i=(x-degree); i<=(x+degree); i++){
    for(j=(y-degree); j<=(y+degree); j++){
      element[i][j].bright = element[i][j].bright*(1+(1/(degree*5)));
    }
  }
}

// Enlarges the activated element and proportionally shrinks the 
// adjacent elements to make room.  degree controls how much 
// shrinking/expanding goes on.
function adjacencySize(degree,x,y){
  
  var k=elementSize*1.3;
  
  // Shrink adjacent
  for(i=(x-degree); i<=(x+degree); i++){
    for(j=(y-degree); j<=(y+degree); j++){
      element[i][j].size = elementSize*0.8;
    }
  }
  // Enlarge main
  element[x][y].size = k;
}