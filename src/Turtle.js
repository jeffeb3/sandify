import React from 'react';

var Turtle = React.createClass({

  initialise: function(){
    // Get a handle for the canvases in the document
    // TBC: implement the method documented here:
    // https://stackoverflow.com/questions/33924150/how-to-access-canvas-context-in-react
    this.imageCanvas = document.getElementById("imageCanvas");
    this.imageContext = this.imageCanvas.getContext('2d');

    this.imageContext.textAlign = "center";
    this.imageContext.textBaseline = "middle";

    this.imageContext.shadowOffsetX = 1;
    this.imageContext.shadowOffsetY = 0;
    this.imageContext.shadowBlur = 15;
    this.imageContext.shadowColor = '//rgba(0, 0, 0, 0)';////

    this.turtleCanvas = document.getElementById("turtleCanvas");
    this.turtleContext = this.turtleCanvas.getContext('2d');

    // the turtle takes precedence when compositing
    this.turtleContext.globalCompositeOperation = 'destination-over';

    // setup the state of the turtle
    this.turtle = undefined;

    this.setup();

  },

  setup: function () {
     this.turtle = { pos: {
                   x: 0,
                   y: 0
                },
                angle: 0,
                penDown: true,
                width: 1,
                visible: true,
                redraw: true, // does this belong here?
                wrap: true,
                colour: {r: 0, g: 0, b: 0, a: 1},
              };
     this.imageContext.lineWidth = this.turtle.width;
     this.imageContext.strokeStyle = "black";
     this.imageContext.globalAlpha = 1;
  },

  // draw the turtle and the current image if redraw is true
  // for complicated drawings it is much faster to turn redraw off
  drawIf: function () {
     if (this.turtle.redraw) this.draw();
  },

  // use canvas centered coordinates facing upwards
  centerCoords : function (context) {
     var width = context.canvas.width;
     var height = context.canvas.height;
     context.translate(width/2, height/2);
     context.transform(1, 0, 0, -1, 0, 0);
  },

  // draw the turtle and the current image
  draw: function () {
     this.clearContext(this.turtleContext);
     if (this.turtle.visible) {
        var x = this.turtle.pos.x;
        var y = this.turtle.pos.y;
        var w = 10;
        var h = 15;
        this.turtleContext.save();
        // use canvas centered coordinates facing upwards
        this.centerCoords(this.turtleContext);
        // move the origin to the turtle center
        this.turtleContext.translate(x, y);
        // rotate about the center of the turtle
        this.turtleContext.rotate(-this.turtle.angle);
        // move the turtle back to its position
        this.turtleContext.translate(-x, -y);
        // draw the turtle icon
        this.turtleContext.beginPath();
        this.turtleContext.moveTo(x - w/2, y);
        this.turtleContext.lineTo(x + w/2, y);
        this.turtleContext.lineTo(x, y + h);
        this.turtleContext.closePath();
        this.turtleContext.fillStyle = "green";
        this.turtleContext.fill();
        this.turtleContext.restore();
     }
     this.turtleContext.drawImage(this.imageCanvas, 0, 0, 300, 300, 0, 0, 300, 300);
  },

  // clear the display, don't move the turtle
  clear: function () {
     this.clearContext(this.imageContext);
     this.drawIf();
  },

  clearContext: function (context) {
     context.save();
     context.setTransform(1,0,0,1,0,0);
     context.clearRect(0,0,context.canvas.width,context.canvas.height);
     context.restore();
  },

  // reset the whole system, clear the display and move turtle back to
  // origin, facing the Y axis.
  reset: function () {
     this.setup();
     this.clear();
     this.draw();
  },

  // Trace the forward motion of the turtle, allowing for possible
  // wrap-around at the boundaries of the canvas.
  forward: function (distance) {
     this.imageContext.save();
     this.centerCoords(this.imageContext);
     this.imageContext.beginPath();
     // get the boundaries of the canvas
     var maxX = this.imageContext.canvas.width / 2;
     var minX = -this.imageContext.canvas.width / 2;
     var maxY = this.imageContext.canvas.height / 2;
     var minY = -this.imageContext.canvas.height / 2;
     var x = this.turtle.pos.x;
     var y = this.turtle.pos.y;
     // trace out the forward steps
     while (distance > 0) {
        // move the to current location of the turtle
        this.imageContext.moveTo(x, y);
        // calculate the new location of the turtle after doing the forward movement
        var cosAngle = Math.cos(this.turtle.angle);
        var sinAngle = Math.sin(this.turtle.angle);
        var newX = x + sinAngle  * distance;
        var newY = y + cosAngle * distance;
        // wrap on the X boundary
        function xWrap(_self, cutBound, otherBound){
           var distanceToEdge = Math.abs((cutBound - x) / sinAngle);
           var edgeY = cosAngle * distanceToEdge + y;
           _self.imageContext.lineTo(cutBound, edgeY);
           distance -= distanceToEdge;
           x = otherBound;
           y = edgeY;
        }
        // wrap on the Y boundary
        function yWrap(_self, cutBound, otherBound) {
           var distanceToEdge = Math.abs((cutBound - y) / cosAngle);
           var edgeX = sinAngle * distanceToEdge + x;
           _self.imageContext.lineTo(edgeX, cutBound);
           distance -= distanceToEdge;
           x = edgeX;
           y = otherBound;
        }
        // don't wrap the turtle on any boundary
        function noWrap(_self)
        {
          var x = _self.turtle.pos.x;
          var y = _self.turtle.pos.y;

          var lineargradient = _self.imageContext.createLinearGradient(y,x,newY,newX);
            lineargradient.addColorStop(0, 'black');
            lineargradient.addColorStop(0.5, 'white');
            lineargradient.addColorStop(1, 'black');
            //_self.imageContext.fillStyle = lineargradient;
            //_self.imageContext.strokeStyle = lineargradient;
           _self.imageContext.lineTo(newX, newY);
           _self.turtle.pos.x = newX;
           _self.turtle.pos.y = newY;
           distance = 0;
        }
        // if wrap is on, trace a part segment of the path and wrap on boundary if necessary
        if (this.turtle.wrap) {
           if (newX > maxX)
              xWrap(maxX, minX);
           else if (newX < minX)
              xWrap(minX, maxX);
           else if (newY > maxY)
              yWrap(maxY, minY);
           else if (newY < minY)
              yWrap(minY, maxY);
           else
              noWrap(this);
        }
        // wrap is not on.
        else {
           noWrap(this);
        }
     }
     // only draw if the pen is currently down.
     if (this.turtle.penDown)
        this.imageContext.stroke();
     this.imageContext.restore();
     this.drawIf();
  },

  /*
  // move the turtle forward by some distance from its current position
  forward: function (distance) {
     this.imageContext.save();
     centerCoords(imageContext);
     this.imageContext.beginPath();
     this.imageContext.moveTo(this.turtle.pos.x, this.turtle.pos.y);
     this.turtle.pos.x += Math.sin(this.turtle.angle) * distance;
     this.turtle.pos.y += Math.cos(this.turtle.angle) * distance;
     this.imageContext.lineTo(this.turtle.pos.x, this.turtle.pos.y);
     // only draw if the pen is currently down.
     if (this.turtle.penDown)
        this.imageContext.stroke();
     this.imageContext.restore();
     drawIf();
  },
  */

  // turn edge wrapping on/off
  wrap: function (bool) {
     this.turtle.wrap = bool;
  },

  // show/hide the turtle
  hideTurtle: function () {
     this.turtle.visible = false;
     this.drawIf();
  },

  // show/hide the turtle
  showTurtle: function () {
     this.turtle.visible = true;
     this.drawIf();
  },

  // turn on/off redrawing
  redrawOnMove: function (bool) {
     this.turtle.redraw = bool;
  },

  // lift up the pen (don't draw)
  penup: function () { this.turtle.penDown = false; },
  // put the pen down (do draw)
  pendown: function () { this.turtle.penDown = true; },

  // turn right by an angle in degrees
  right: function (angle) {
     this.turtle.angle += this.degToRad(angle);
     this.drawIf();
  },

  // turn left by an angle in degrees
  left: function (angle) {
     this.turtle.angle -= this.degToRad(angle);
     this.drawIf();
  },

  // move the turtle to a particular coordinate (don't draw on the way there)
  goto: function (x,y) {
     this.turtle.pos.x = x;
     this.turtle.pos.y = y;
     this.drawIf();
  },

  // set the angle of the turtle in degrees
  angle: function (angle) {
     this.turtle.angle = this.degToRad(angle);
  },

  // convert degrees to radians
  degToRad: function (deg) {
     return deg / 180 * Math.PI;
  },

  // convert radians to degrees
  radToDeg: function (deg) {
     return deg * 180 / Math.PI;
  },

  // set the width of the line
  width: function (w) {
     this.turtle.width = w;
     this.imageContext.lineWidth = w;
  },

  // write some text at the turtle position.
  // ideally we'd like this to rotate the text based on
  // the turtle orientation, but this will require some clever
  // canvas transformations which aren't implemented yet.
  write: function (msg) {
     this.imageContext.save();
     this.centerCoords(this.imageContext);
     this.imageContext.translate(this.turtle.pos.x, this.turtle.pos.y);
     this.imageContext.transform(1, 0, 0, -1, 0, 0);
     this.imageContext.translate(-this.turtle.pos.x, -this.turtle.pos.y);
     this.imageContext.fillText(msg, this.turtle.pos.x, this.turtle.pos.y);
     this.imageContext.restore();
     this.drawIf();
  },

  // set the colour of the line using RGB values in the range 0 - 255.
  colour: function (r,g,b,a) {
      this.imageContext.strokeStyle = "rgba(" + r + "," + g + "," + b + "," + a + ")";
      this.turtle.colour.r = r;
      this.turtle.colour.g = g;
      this.turtle.colour.b = b;
      this.turtle.colour.a = a;
  },

  // Generate a random integer between low and hi
  random: function (low, hi) {
     return Math.floor(Math.random() * (hi - low + 1) + low);
  },

  repeat: function (_self, n, action) {
     for (var count = 1; count <= n; count++)
        action(_self);
  },

  animate: function (f,ms) {
     return setInterval(f, ms);
  },

  setFont: function (font) {
     this.imageContext.font = font;
  },


  square: function(side) {
    for(var i = 0; i<4; i++){
        this.forward(side);
        this.right(90);
    }
  },

  demo: function() {
     this.hideTurtle();
     this.colour(0,0,255,1);
     for(var s = 100; s > 0; s -= 10) {
        this.square(s);
        this.right(36);
     }
  },

  curve: function(n, length, angle){
    for(var i=0; i<n; i++){
        this.forward(length);
        this.left(angle);
    }

  },

  arc: function(radius, angle){

    var arc_length = 2 * Math.PI * radius * Math.abs(angle) /360;

    var n = parseInt(arc_length / 4) + 1;

    var step_length = arc_length / n;

    var step_angle = parseFloat(angle) / n;
    var step_reduction = 3;
    this.left(step_angle/2);

    this.curve(n, step_length, step_angle);
    this.right(step_angle/2);

  },

  spike: function(centre_radius,spike_height, curve_radius,n){


    var half_side_angle = 360 / (2*n);

    var half_spike_base = Math.tan (this.degToRad(half_side_angle)) * centre_radius;

    var spike_base_angle = this.radToDeg(Math.atan(spike_height / half_spike_base));

    var side_deflection_angle = 360 / n;
    var spike_side_initial_angle = side_deflection_angle - spike_base_angle;


    var spike_side_length = Math.sqrt((half_spike_base * half_spike_base) + (spike_height * spike_height));


    var half_spike_top_angle = 90 - spike_base_angle;
    var spike_top_turn_angle = 180 - (2 * half_spike_top_angle);

    var chord_angle = this.radToDeg(2* (Math.asin(spike_side_length/(2*curve_radius))));

    this.left(spike_side_initial_angle);
    this.right(chord_angle/2);
    this.arc(curve_radius,chord_angle);
    this.right(chord_angle/2);

    this.left(spike_top_turn_angle);

    this.right(chord_angle/2);
    this.arc(curve_radius,chord_angle);
    this.right(chord_angle/2);

    this.right(spike_base_angle);


},

 radial:function(centre_radius,spike_height,curve_radius,n){
      for(var i=0; i<n; i++){

         this.spike(centre_radius,spike_height,curve_radius,n);
      }

},

 fancy_radial:function(){

    var height = 130;
    var original_height = height;
    // ratio of centre radius to spike length

    var ratio = 1/1.7;

    this.colour(211,61,0,1);

    // 39 is a hack...
    for(var i = 0; i <39; i++){
        height = height -3;

        var centre = height * (1-ratio);
        var spike_height = height * ratio;

        this.goto(centre,(centre/2));
        // hack co-efficient to avoid me having to calculate it
        this.angle(i*0.8);

        this.radial(centre,spike_height,60,7);
        this.goto(0,0)
        this.angle(0)

        this.hideTurtle();
     }
},
  componentDidMount: function() {
    this.initialise();
    this.fancy_radial();
  },

  render: function() {
    const {width, height} = this.props;
    return (
      <div>
        <h4>Canvas</h4>
        <canvas id="turtleCanvas" width="300" height="300"/>
        <div id="imageCanvasContainer">
          <canvas id="imageCanvas" width="300" height="300"></canvas>
        </div>
      </div>
    );
  }


});

export default Turtle;
