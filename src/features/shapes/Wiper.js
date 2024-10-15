import { degToRad } from "@/common/geometry"
import Victor from "victor"
import Shape from "./Shape"
import { getMachine } from "@/features/machines/machineFactory"

const options = {
  wiperType: {
    title: "Wiper type",
    type: "togglebutton",
    choices: ["Lines", "Spiral"],
  },
  wiperSize: {
    title: "Wiper size",
    min: 1,
    randomMin: 3,
  },
  wiperAngleDeg: {
    title: "Wiper angle",
    isVisible: (layer, state) => {
      return state.wiperType === "Lines"
    },
    randomMin: 0,
    randomMax: 360,
  },
}

const outOfBounds = (point, width, height) => {
  if (point.x < -width / 2.0) {
    return true
  }
  if (point.y < -height / 2.0) {
    return true
  }
  if (point.x > width / 2.0) {
    return true
  }
  if (point.y > height / 2.0) {
    return true
  }

  return false
}

// Intersect the line with the boundary, and return the point exactly on the boundary.
// This will keep the shape. i.e. It will follow the line segment, and return the point on that line
// segment.
function boundPoint(good, bad, size_x, size_y) {
  let dx = good.x - bad.x
  let dy = good.y - bad.y

  let fixed = new Victor(bad.x, bad.y)
  let distance = 0

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

function spiralVertices(state) {
  // Determine the max radius
  const machine = getMachine(state.machine)
  const { height, width } = machine
  let { maxRadius, type } = state.machine

  if (type === "rectangular") {
    maxRadius = Math.sqrt(Math.pow(height / 2, 2.0) + Math.pow(width / 2, 2.0))
  }

  let vertices = []
  let emergencyBreak = 0
  let radius = 0.1
  let angle = 0
  const arcLength = 1.0
  const radiusPerAngle = state.shape.wiperSize / (2.0 * Math.PI)

  while (radius <= maxRadius) {
    // Save where we are right now.
    vertices.push(
      new Victor(radius * Math.cos(angle), radius * Math.sin(angle)),
    )

    // We want to have the next point be about the right arc length.
    let deltaAngle = (arcLength / radius) * 2.0 * Math.PI

    // Limit this at small radii
    deltaAngle = Math.min(deltaAngle, 0.1)

    // Update for the next point.
    angle += deltaAngle
    radius += deltaAngle * radiusPerAngle

    emergencyBreak += 1
    if (emergencyBreak > 1e9) {
      // If we get to this point: bail. We did something terrible.
      break
    }
  }

  return vertices
}

function linearVertices(state) {
  // Get the angle between 0,180
  let angle = (180.0 - (state.shape.wiperAngleDeg % 360)) % 180.0

  if (angle < 0.0) {
    angle += 180.0
  }
  angle = degToRad(angle)

  // Start with the defaults for 0,45
  let height = 1
  let width = 1
  let outputVertices = []
  let machine = state.machine

  if (machine.type === "rectangular") {
    height = machine.maxY - machine.minY
    width = machine.maxX - machine.minX
  } else {
    height = machine.maxRadius * 2.0
    width = height
  }

  let startLocation = new Victor(-width / 2.0, height / 2.0)
  let cosa = Math.cos(angle)
  let sina = Math.sin(angle)

  // These can be zero, but infinity isn't great for out math, so let's just clip it.
  if (Math.abs(cosa) < 1.0e-10) {
    cosa = 1.0e-10
  }
  if (Math.abs(sina) < 1.0e-10) {
    sina = 1.0e-10
  }
  let orig_delta_w = new Victor(state.shape.wiperSize / cosa, 0.0)
  let orig_delta_h = new Victor(0.0, -state.shape.wiperSize / sina)

  if (angle > Math.PI / 4.0 && angle < 0.75 * Math.PI) {
    // flip the logic of x,y
    let temp = orig_delta_w.clone()
    orig_delta_w = orig_delta_h.clone()
    orig_delta_h = temp
  }
  if (angle > Math.PI / 2.0) {
    startLocation = new Victor(-width / 2.0, -height / 2.0)
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
      let corner = boundPoint(
        nextWidthPoint.clone().subtract(delta_w),
        nextWidthPoint,
        width / 2.0,
        height / 2.0,
      )
      outputVertices.push(corner)
      if (nearEnough(endLocation, corner)) {
        break
      }
      nextWidthPoint = boundPoint(
        nextHeightPoint,
        nextWidthPoint,
        width / 2.0,
        height / 2.0,
      )
      delta_w = orig_delta_h
    }
    outputVertices.push(nextWidthPoint)
    if (nearEnough(endLocation, nextWidthPoint)) {
      break
    }

    // "down-left"
    nextHeightPoint = nextHeightPoint.clone().add(delta_h)
    if (outOfBounds(nextHeightPoint, width, height)) {
      nextHeightPoint = boundPoint(
        nextWidthPoint,
        nextHeightPoint,
        width / 2.0,
        height / 2.0,
      )
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
      let corner = boundPoint(
        nextHeightPoint.clone().subtract(delta_h),
        nextHeightPoint,
        width / 2.0,
        height / 2.0,
      )
      outputVertices.push(corner)
      if (nearEnough(endLocation, corner)) {
        break
      }
      nextHeightPoint = boundPoint(
        nextWidthPoint,
        nextHeightPoint,
        width / 2.0,
        height / 2.0,
      )
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
      nextWidthPoint = boundPoint(
        nextHeightPoint,
        nextWidthPoint,
        width / 2.0,
        height / 2.0,
      )
      delta_w = orig_delta_h
    }
  }

  return outputVertices
}

export default class Wiper extends Shape {
  constructor() {
    super("wiper")
    this.label = "Wiper"
    this.selectGroup = "Erasers"
    this.usesMachine = true
    this.shouldCache = false
    this.autosize = false
  }

  canMove(state) {
    return false
  }

  canChangeSize(state) {
    return false
  }

  canRotate(state) {
    return false
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        wiperAngleDeg: 15,
        wiperSize: 4,
        wiperType: "Lines",
      },
    }
  }

  getVertices(state) {
    if (state.shape.wiperType === "Lines") {
      return linearVertices(state)
    } else {
      return spiralVertices(state)
    }
  }

  getOptions() {
    return options
  }
}
