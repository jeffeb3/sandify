import { degToRad } from '../common/Geometry'

import Victor from 'victor'
import Shape, { shapeOptions } from './Shape'

const options = {
  ...shapeOptions,
  ...{
    wiperAngleDeg: {
      title: 'Wiper angle',
    },
    wiperSize: {
      title: 'Wiper size',
    },
  }
}

const outOfBounds = (point, width, height) => {
  if (point.x < -width/2.0) {
    return true
  }
  if (point.y < -height/2.0) {
    return true
  }
  if (point.x > width/2.0) {
    return true
  }
  if (point.y > height/2.0) {
    return true
  }
  return false
}

// Intersect the line with the boundary, and return the point exactly on the boundary.
// This will keep the shape. i.e. It will follow the line segment, and return the point on that line
// segment.
function boundPoint(good, bad, size_x, size_y) {
  var dx = good.x - bad.x
  var dy = good.y - bad.y

  var fixed = Victor(bad.x, bad.y)
  var distance = 0
  if (bad.x < -size_x || bad.x > size_x) {
    if (bad.x < -size_x) {
      // we are leaving the left
      fixed.x = -size_x
    } else {
      // we are leaving the right
      fixed.x = size_x
    }
    distance = (fixed.x - good.x) / dx
    fixed.y = good.y + distance * dy
    // We fixed x, but y might have the same problem, so we'll rerun this, with different points.
    return boundPoint(good, fixed, size_x, size_y)
  }
  if (bad.y < -size_y || bad.y > size_y) {
    if (bad.y < -size_y) {
      // we are leaving the bottom
      fixed.y = -size_y
    } else {
      // we are leaving the top
      fixed.y = size_y
    }
    distance = (fixed.y - good.y) / dy
    fixed.x = good.x + distance * dx
  }
  return fixed
}

function nearEnough(end, point) {
  if (point.clone().subtract(end).length() < 0.01) {
    return true
  }
  return false
}

export default class Wiper extends Shape {
  constructor() {
    super('Wiper')
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        type: 'wiper',
        wiperAngleDeg: 15,
        wiperSize: 12,
        startingSize: 1,
        repeatEnabled: false
      }
    }
  }

  getVertices(state) {
    var outputVertices = []

    // Get the angle between 0,180
    let angle = (180.0 - (state.shape.wiperAngleDeg % 360)) % 180.0
    if (angle < 0.0) {
      angle += 180.0
    }
    angle = degToRad(angle)

    // Start with the defaults for 0,45
    let height = 1
    let width = 1
    let machine = state.machine
    if (machine.rectangular) {
      height = machine.maxY - machine.minY
      width = machine.maxX - machine.minX
    } else {
      height = machine.maxRadius * 2.0
      width = height
    }

    let startLocation = Victor(-width/2.0, height/2.0)
    let cosa = Math.cos(angle)
    let sina = Math.sin(angle)

    // These can be zero, but infinity isn't great for out math, so let's just clip it.
    if (Math.abs(cosa) < 1.0e-10) {
      cosa = 1.0e-10
    }
    if (Math.abs(sina) < 1.0e-10) {
      sina = 1.0e-10
    }
    let orig_delta_w = Victor(state.shape.wiperSize / cosa, 0.0)
    let orig_delta_h = Victor(0.0, -state.shape.wiperSize / sina)

    if (angle > Math.PI/4.0 && angle < 0.75 * Math.PI) {
      // flip the logic of x,y
      let temp = orig_delta_w.clone()
      orig_delta_w = orig_delta_h.clone()
      orig_delta_h = temp
    }
    if (angle > Math.PI/2.0) {
      startLocation = Victor(-width/2.0, -height/2.0)
      orig_delta_w = orig_delta_w.clone().multiply(Victor(-1.0, -1.0))
      orig_delta_h = orig_delta_h.clone().multiply(Victor(-1.0, -1.0))
    }
    let delta_w = orig_delta_w
    let delta_h = orig_delta_h
    let endLocation = startLocation.clone().multiply(Victor(-1.0, -1.0))
    outputVertices.push(startLocation)
    let nextWidthPoint = startLocation
    let nextHeightPoint = startLocation

    let emergency_break = 0
    while (emergency_break < 1000) {
      emergency_break += 1

      // "right"
      nextWidthPoint = nextWidthPoint.clone().add(delta_w)
      if (outOfBounds(nextWidthPoint, width, height)) {
        let corner = boundPoint(nextWidthPoint.clone().subtract(delta_w), nextWidthPoint, width/2.0, height/2.0)
        outputVertices.push(corner)
        if (nearEnough(endLocation, corner)) {
          break
        }
        nextWidthPoint = boundPoint(nextHeightPoint, nextWidthPoint, width/2.0, height/2.0)
        delta_w = orig_delta_h
      }
      outputVertices.push(nextWidthPoint)
      if (nearEnough(endLocation, nextWidthPoint)) {
        break
      }

      // "down-left"
      nextHeightPoint = nextHeightPoint.clone().add(delta_h)
      if (outOfBounds(nextHeightPoint, width, height)) {
        nextHeightPoint = boundPoint(nextWidthPoint, nextHeightPoint, width/2.0, height/2.0)
        delta_h = orig_delta_w
      }
      outputVertices.push(nextHeightPoint)
      if (nearEnough(endLocation, nextHeightPoint)) {
        break
      }

      // "down"
      nextHeightPoint = nextHeightPoint.clone().add(delta_h)
      outputVertices.push(nextHeightPoint)
      if (nearEnough(endLocation, nextHeightPoint)) {
        break
      }
      if (outOfBounds(nextHeightPoint, width, height)) {
        let corner = boundPoint(nextHeightPoint.clone().subtract(delta_h), nextHeightPoint, width/2.0, height/2.0)
        outputVertices.push(corner)
        if (nearEnough(endLocation, corner)) {
          break
        }
        nextHeightPoint = boundPoint(nextWidthPoint, nextHeightPoint, width/2.0, height/2.0)
        delta_h = orig_delta_w
      }
      outputVertices.push(nextHeightPoint)
      if (nearEnough(endLocation, nextHeightPoint)) {
        break
      }

      // "up-right"
      nextWidthPoint = nextWidthPoint.clone().add(delta_w)
      outputVertices.push(nextWidthPoint)
      if (nearEnough(endLocation, nextWidthPoint)) {
        break
      }
      if (outOfBounds(nextWidthPoint, width, height)) {
        nextWidthPoint = boundPoint(nextHeightPoint, nextWidthPoint, width/2.0, height/2.0)
        delta_w = orig_delta_h
      }
    }
    console.log(outputVertices.length)
    return outputVertices
  }

  getOptions() {
    return options
  }
}
