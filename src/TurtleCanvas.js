import React from 'react';
import ReactDOM from 'react-dom';


// This is just an example to get _something_ drawn on the screen. We will replace the guts of this
// with something that can really draw the turtle's path, eventually.
//
// Also, this is taking 100% CPU, which is no good.

var TurtleCanvas = React.createClass({

  componentDidMount: function() {
    var context = ReactDOM.findDOMNode(this).getContext('2d');
    this.paint(context);
  },

  componentDidUpdate: function() {
    var context = ReactDOM.findDOMNode(this).getContext('2d');
    context.clearRect(0, 0, this.props.width, this.props.height);
    this.paint(context);
  },

  paint: function(context) {
    context.save();
    context.translate(100,100);
    context.beginPath();
    context.lineWidth = "1";
    context.strokeStyle = "green";
    context.moveTo(0,0)
    for (var i=0; i<this.props.vertices.length; i++) {
      context.lineTo(this.props.vertices[i].x,
                     this.props.vertices[i].y);
    }
    context.stroke();
    context.restore();
  },

  render: function() {
    const {width, height} = this.props;
    return (
      <canvas
        width={width}
        height={height}
      />
    );
  }

});

export default TurtleCanvas;

