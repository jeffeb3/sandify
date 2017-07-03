
// I'm trying to define a simple struct that we can use everywhere we need vertices. I don't see a
// problem letting this bloat a little.
//
// Currently, I'm using this as input to the GCodeGenerator for the locations of gcode.
//
function Vertex (x, y, speed=0) {
  return {
    x: x,
    y: y,
    f: speed
  }
}

export default Vertex
