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

// calculate the coterminal angle (0..2*PI) of a given angle
export const coterminal = function(angle) {
  return angle - Math.floor(angle / (Math.PI * 2)) * Math.PI * 2
}

export const angle = function(point) {
  return Math.atan2(point.y, point.x)
}

// returns whether a point is on the perimeter of a circle.
export const onCirclePerimeter = function(v, size, delta=.001) {
  let r = Math.pow(v.x, 2) + Math.pow(v.y, 2)
  return r >= Math.pow(size, 2) - delta
}

// returns whether a point is on the segment defined by start and end
export const onSegment = function(start, end, point) {
  if (start.distance(point) + end.distance(point) - start.distance(end) < 0.001) {
    return true;
  } else {
    return false;
  }
}
