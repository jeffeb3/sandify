// A simple struct that we can use everywhere we need vertices. I don't see a
// problem letting this bloat a little.
export const Vertex = (x, y, speed=0) => {
  return {
    x: x,
    y: y,
    f: speed
  }
}

// convert degrees to radians
export const degToRad = (deg) => {
  return deg / 180.0 * Math.PI
}

// convert radians to degrees
export const radToDeg = (rad) => {
  return rad * 180.0 / Math.PI
}

export const distance = (v1, v2) => {
  return Math.sqrt(Math.pow(v1.x - v2.x, 2.0) + Math.pow(v1.y - v2.y, 2.0))
}
