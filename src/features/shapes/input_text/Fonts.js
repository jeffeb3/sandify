import Victor from "victor"
import { raysol_cursive } from "./raysol_cursive"
import { raysol_sanserif } from "./raysol_sanserif"

const fontSpacing = 1.5

// Format for vertices: [x,y,b] where in a 0:7(8) by -1:7 grid defining x,y and b defines the line or curve.
// Bulge directions could be represented by a 0:4 list starting at none, then NE and going clockwise.
// 4  1
// 3  2
let billsey = {
  " ": [[8, -1, 0]],
  A: [
    [0, 0, 0],
    [3.5, 7, 0],
    [7, 0, 0],
    [5, 3.5, 0],
    [2, 3.5, 0],
    [0, 0, 0],
    [0, -1, 0],
    [8, -1, 0],
  ],
  B: [
    [0, 0, 0],
    [0, 7, 0],
    [3.5, 7, 0],
    [7, 5.25, 1],
    [3.5, 3.5, 2],
    [0, 3.5, 0],
    [3.5, 3.5, 0],
    [7, 1.75, 1],
    [3.5, 0, 2],
    [0, 0, 0],
    [0, -1, 0],
    [8, -1, 0],
  ],
  C: [
    [3.5, -1, 0],
    [3.5, 0, 0],
    [0, 3.5, 3],
    [3.5, 7, 4],
    [7, 5.25, 1],
    [3.5, 7, 1],
    [0, 3.5, 4],
    [3.5, 0, 3],
    [7, 1.75, 2],
    [3.5, 0, 2],
    [3.5, -1, 0],
    [8, -1, 0],
  ],
  D: [
    [0, 0, 0],
    [0, 7, 0],
    [3.5, 7, 0],
    [7, 3.5, 1],
    [3.5, 0, 2],
    [0, 0, 0],
    [0, -1, 0],
    [8, -1, 0],
  ],
  E: [
    [0, 0, 0],
    [0, 7, 0],
    [7, 7, 0],
    [0, 7, 0],
    [0, 3.5, 0],
    [3.5, 3.5, 0],
    [0, 3.5, 0],
    [0, 0, 0],
    [7, 0, 0],
    [0, 0, 0],
    [0, -1, 0],
    [8, -1, 0],
  ],
  F: [
    [0, 0, 0],
    [0, 7, 0],
    [7, 7, 0],
    [0, 7, 0],
    [0, 3.5, 0],
    [3.5, 3.5, 0],
    [0, 3.5, 0],
    [0, 0, 0],
    [0, -1, 0],
    [8, -1, 0],
  ],
  G: [
    [3.5, -1, 0],
    [3.5, 0, 0],
    [0, 3.5, 3],
    [3.5, 7, 4],
    [7, 5.25, 1],
    [3.5, 7, 1],
    [0, 3.5, 4],
    [3.5, 0, 3],
    [7, 1.75, 2],
    [5.25, 1.75, 0],
    [7, 1.75, 0],
    [3.5, 0, 2],
    [3.5, -1, 0],
    [8, -1, 0],
  ],
  H: [
    [0, 0, 0],
    [0, 7, 0],
    [0, 3.5, 0],
    [7, 3.5, 0],
    [7, 7, 0],
    [7, 0, 0],
    [7, 3.5, 0],
    [0, 3.5, 0],
    [0, 0, 0],
    [0, -1, 0],
    [8, -1, 0],
  ],
  I: [
    [3.5, -1, 0],
    [3.5, 7, 0],
    [0, 7, 0],
    [7, 7, 0],
    [3.5, 7, 0],
    [3.5, 0, 0],
    [0, 0, 0],
    [7, 0, 0],
    [3.5, 0, 0],
    [3.5, -1, 0],
    [8, -1, 0],
  ],
  J: [
    [3.5, -1, 0],
    [3.5, 0, 0],
    [0, 1.75, 3],
    [3.5, 0, 3],
    [7, 1.75, 2],
    [7, 7, 0],
    [7, 1.75, 0],
    [3.5, 0, 2],
    [3.5, -1, 0],
    [8, -1, 0],
  ],
  K: [
    [0, 0, 0],
    [0, 7, 0],
    [0, 1.75, 0],
    [3.5, 3.5, 0],
    [7, 7, 0],
    [3.5, 3.5, 0],
    [7, 0, 0],
    [3.5, 3.5, 0],
    [0, 1.75, 0],
    [0, 0, 0],
    [0, -1, 0],
    [8, -1, 0],
  ],
  L: [
    [0, 0, 0],
    [0, 7, 0],
    [0, 0, 0],
    [7, 0, 0],
    [0, 0, 0],
    [0, -1, 0],
    [8, -1, 0],
  ],
  M: [
    [0, 0, 0],
    [0, 7, 0],
    [3.5, 0, 0],
    [7, 7, 0],
    [7, 0, 0],
    [7, 7, 0],
    [3.5, 0, 0],
    [0, 7, 0],
    [0, 0, 0],
    [0, -1, 0],
    [8, -1, 0],
  ],
  N: [
    [0, 0, 0],
    [0, 7, 0],
    [7, 0, 0],
    [7, 7, 0],
    [7, 0, 0],
    [0, 7, 0],
    [0, 0, 0],
    [0, -1, 0],
    [8, -1, 0],
  ],
  O: [
    [3.5, -1, 0],
    [3.5, 0, 0],
    [0, 3.5, 3],
    [3.5, 7, 4],
    [7.0, 3.5, 1],
    [3.5, 0, 2],
    [3.5, -1, 0],
    [8, -1, 0],
  ],
  P: [
    [0, 0, 0],
    [0, 7, 0],
    [3.5, 7, 0],
    [7, 5.25, 1],
    [3.5, 3.5, 2],
    [0, 3.5, 0],
    [0, 0, 0],
    [0, -1, 0],
    [8, -1, 0],
  ],
  Q: [
    [3.5, -1, 0],
    [3.5, 0, 0],
    [0, 3.5, 3],
    [3.5, 7, 4],
    [7.0, 3.5, 1],
    [3.5, 0, 2],
    [4.325, 0.5, 4],
    [6.075, 0, 0],
    [7, 0.5, 2],
    [6.075, 0, 2],
    [4.325, 0.5, 0],
    [3.5, 0, 4],
    [3.5, -1, 0],
    [8, -1, 0],
  ],
  R: [
    [0, 0, 0],
    [0, 7, 0],
    [3.5, 7, 0],
    [7, 5.25, 1],
    [3.5, 3.5, 2],
    [7, 0, 0],
    [3.5, 3.5, 0],
    [0, 3.5, 0],
    [0, 0, 0],
    [0, -1, 0],
    [8, -1, 0],
  ],
  S: [
    [3.5, -1, 0],
    [3.5, 0, 0],
    [0, 1.75, 3],
    [3.5, 0, 3],
    [7, 1.75, 2],
    [3.5, 3.5, 1],
    [0, 5.25, 3],
    [3.5, 7, 4],
    [7, 5.25, 1],
    [3.5, 7, 1],
    [0, 5.25, 4],
    [3.5, 3.5, 3],
    [7, 1.75, 1],
    [3.5, 0, 2],
    [3.5, -1, 0],
    [8, -1, 0],
  ],
  T: [
    [3.5, -1, 0],
    [3.5, 7, 0],
    [0, 7, 0],
    [7, 7, 0],
    [3.5, 7, 0],
    [3.5, 0, 0],
    [3.5, -1, 0],
    [8, -1, 0],
  ],
  U: [
    [3.5, -1, 0],
    [3.5, 0, 0],
    [0, 3.5, 3],
    [0, 7, 0],
    [0, 3.5, 0],
    [3.5, 0, 3],
    [7, 3.5, 2],
    [7, 7, 0],
    [7, 3.5, 0],
    [3.5, 0, 2],
    [3.5, -1, 0],
    [8, -1, 0],
  ],
  V: [
    [3.5, -1, 0],
    [3.5, 0, 0],
    [0, 7, 0],
    [3.5, 0, 0],
    [7, 7, 0],
    [3.5, 0, 0],
    [3.5, -1, 0],
    [8, -1, 0],
  ],
  W: [
    [1.75, -1, 0],
    [1.75, 0, 0],
    [0, 7, 0],
    [1.75, 0, 0],
    [3.5, 7, 0],
    [5.25, 0, 0],
    [7, 7, 0],
    [5.25, 0, 0],
    [3.5, 7, 0],
    [1.75, 0, 0],
    [1.75, -1, 0],
    [8, -1, 0],
  ],
  X: [
    [0, 0, 0],
    [7, 7, 0],
    [3.5, 3.5, 0],
    [0, 7, 0],
    [7, 0, 0],
    [3.5, 3.5, 0],
    [0, 0, 0],
    [0, -1, 0],
    [8, -1, 0],
  ],
  Y: [
    [3.5, -1, 0],
    [3.5, 3.5, 0],
    [0, 7, 0],
    [3.5, 3.5, 0],
    [7, 7, 0],
    [3.5, 3.5, 0],
    [3.5, -1, 0],
    [8, -1, 0],
  ],
  Z: [
    [0, 0, 0],
    [7, 0, 0],
    [0, 0, 0],
    [7, 7, 0],
    [0, 7, 0],
    [7, 7, 0],
    [0, 0, 0],
    [0, -1, 0],
    [8, -1, 0],
  ],
  0: [
    [3.5, -1, 0],
    [3.5, 0, 0],
    [6, 3.5, 2],
    [3.5, 7, 1],
    [1, 3.5, 4],
    [3.5, 0, 3],
    [3.5, -1, 0],
    [8, -1, 0],
  ],
  1: [
    [0, -1, 0],
    [0, 0, 0],
    [0, 0, 0],
    [7, 0, 0],
    [3.5, 0, 0],
    [3.5, 7, 0],
    [1.5, 6, 2],
    [3.5, 7, 2],
    [3.5, 0, 0],
    [0, 0, 0],
    [0, -1, 0],
    [8, -1, 0],
  ],
  2: [
    [1, -1, 0],
    [1, 0, 0],
    [6, 5.25, 0],
    [3.5, 7, 1],
    [1, 5.25, 4],
    [3.5, 7, 4],
    [6, 5.25, 1],
    [1, 0, 0],
    [6, 0, 0],
    [1, 0, 0],
    [1, -1, 0],
    [8, -1, 0],
  ],
  3: [
    [3.5, -1, 0],
    [3.5, 0, 0],
    [1, 1.75, 3],
    [3.5, 0, 3],
    [6, 1.75, 2],
    [3.5, 3.5, 1],
    [6, 5.25, 2],
    [3.5, 7, 1],
    [1, 5.25, 4],
    [3.5, 7, 4],
    [6, 5.25, 1],
    [3.5, 3.5, 2],
    [6, 1.75, 1],
    [3.5, 0, 2],
    [3.5, -1, 0],
    [8, -1, 0],
  ],
  4: [
    [3.5, -1, 0],
    [3.5, 0, 0],
    [3.5, 7, 0],
    [1, 3.5, 0],
    [6, 3.5, 0],
    [3.5, 3.5, 0],
    [3.5, -1, 0],
    [8, -1, 0],
  ],
  5: [
    [3.5, -1, 0],
    [3.5, 0, 0],
    [1, 1.75, 3],
    [3.5, 0, 3],
    [6, 1.75, 2],
    [3.5, 3.5, 1],
    [1, 3.5, 0],
    [1, 7, 0],
    [6, 7, 0],
    [1, 7, 0],
    [1, 3.5, 0],
    [3.5, 3.5, 0],
    [6, 1.75, 1],
    [3.5, 0, 2],
    [3.5, -1, 0],
    [8, -1, 0],
  ],
  6: [
    [3.5, -1, 0],
    [3.5, 0, 0],
    [1, 1.75, 3],
    [5.25, 7, 4],
    [1, 1.75, 4],
    [3.5, 0, 3],
    [6, 1.75, 2],
    [3.5, 3.5, 1],
    [1, 1.75, 4],
    [3.5, 0, 3],
    [3.5, -1, 0],
    [8, -1, 0],
  ],
  7: [
    [3.5, -1, 0],
    [3.5, 0, 0],
    [6, 7, 0],
    [1, 7, 0],
    [6, 7, 0],
    [3.5, 0, 0],
    [3.5, -1, 0],
    [8, -1, 0],
  ],
  8: [
    [3.5, -1, 0],
    [3.5, 0, 0],
    [1, 1.75, 3],
    [6, 5.25, 0],
    [3.5, 7, 1],
    [1, 5.25, 4],
    [6, 1.75, 0],
    [3.5, 0, 2],
    [3.5, -1, 0],
    [8, -1, 0],
  ],
  9: [
    [3.5, -1, 0],
    [3.5, 0, 0],
    [6, 5.25, 2],
    [3.5, 7, 1],
    [1, 5.25, 4],
    [3.5, 3.5, 3],
    [6, 5.25, 2],
    [3.5, 0, 2],
    [3.5, -1, 0],
    [8, -1, 0],
  ],
  $: [
    [3.5, -1, 0],
    [3.5, 0.5, 0],
    [0, 2.0, 3],
    [3.5, 0.5, 3],
    [7, 2.0, 2],
    [3.5, 3.5, 1],
    [0, 5.0, 3],
    [3.5, 6.5, 4],
    [7, 5.0, 1],
    [3.5, 6.5, 1],
    [3.5, 7, 0],
    [3.5, 0, 0],
    [3.5, -1, 0],
    [8, -1, 0],
  ],
  ".": [
    [3.5, -1, 0],
    [3.5, 0.5, 0],
    [3, 1, 3],
    [3.5, 1.5, 4],
    [4, 1, 1],
    [3.5, 0.5, 2],
    [3.5, -1, 0],
    [8, -1, 0],
  ],
}

// This is a clever way to create a range from 0..32, and then compute an x,y for each of those
// points on the unit circle from zero to pi/2.
const curve = [...Array(32).keys()].map((index) => {
  let angle = ((index + 1) * Math.PI) / 2.0 / 32.0
  return new Victor(Math.cos(angle), Math.sin(angle))
})

const billseyConverter = (vertices) => {
  let newVertices = []
  let prevPoint = new Victor(0, 0)
  vertices.forEach((vertex) => {
    switch (vertex[2]) {
      case 0:
      default:
        newVertices.push(new Victor(vertex[0] / 8.0, vertex[1] / 4.0))
        break
      case 1: // NE
        if (vertex[1] < prevPoint[1]) {
          // clockwise
          let width = Math.abs(vertex[0] - prevPoint[0]) / 8.0
          let height = Math.abs(vertex[1] - prevPoint[1]) / 4.0
          newVertices = newVertices.concat(
            curve
              .map(
                (cv) =>
                  new Victor(
                    cv.x * width + prevPoint[0] / 8.0,
                    cv.y * height + vertex[1] / 4.0,
                  ),
              )
              .reverse(),
          )
        } else {
          // ccwise
          let width = Math.abs(vertex[0] - prevPoint[0]) / 8.0
          let height = Math.abs(vertex[1] - prevPoint[1]) / 4.0
          newVertices = newVertices.concat(
            curve.map(
              (cv) =>
                new Victor(
                  cv.x * width + vertex[0] / 8.0,
                  cv.y * height + prevPoint[1] / 4.0,
                ),
            ),
          )
        }
        newVertices.push(new Victor(vertex[0] / 8.0, vertex[1] / 4.0))
        break
      case 2: // SE
        if (vertex[1] < prevPoint[1]) {
          // clockwise
          let width = Math.abs(vertex[0] - prevPoint[0]) / 8.0
          let height = -Math.abs(vertex[1] - prevPoint[1]) / 4.0
          newVertices = newVertices.concat(
            curve.map(
              (cv) =>
                new Victor(
                  cv.x * width + vertex[0] / 8.0,
                  cv.y * height + prevPoint[1] / 4.0,
                ),
            ),
          )
        } else {
          // ccwise
          let width = Math.abs(vertex[0] - prevPoint[0]) / 8.0
          let height = -Math.abs(vertex[1] - prevPoint[1]) / 4.0
          newVertices = newVertices.concat(
            curve
              .map(
                (cv) =>
                  new Victor(
                    cv.x * width + prevPoint[0] / 8.0,
                    cv.y * height + vertex[1] / 4.0,
                  ),
              )
              .reverse(),
          )
        }
        newVertices.push(new Victor(vertex[0] / 8.0, vertex[1] / 4.0))
        break
      case 3: // SW
        if (vertex[1] > prevPoint[1]) {
          // clockwise
          let width = -Math.abs(vertex[0] - prevPoint[0]) / 8.0
          let height = -Math.abs(vertex[1] - prevPoint[1]) / 4.0
          newVertices = newVertices.concat(
            curve
              .map(
                (cv) =>
                  new Victor(
                    cv.x * width + prevPoint[0] / 8.0,
                    cv.y * height + vertex[1] / 4.0,
                  ),
              )
              .reverse(),
          )
        } else {
          // ccwise
          let width = -Math.abs(vertex[0] - prevPoint[0]) / 8.0
          let height = -Math.abs(vertex[1] - prevPoint[1]) / 4.0
          newVertices = newVertices.concat(
            curve.map(
              (cv) =>
                new Victor(
                  cv.x * width + vertex[0] / 8.0,
                  cv.y * height + prevPoint[1] / 4.0,
                ),
            ),
          )
        }
        newVertices.push(new Victor(vertex[0] / 8.0, vertex[1] / 4.0))
        break
      case 4: // NW
        if (vertex[1] > prevPoint[1]) {
          // clockwise
          let width = -Math.abs(vertex[0] - prevPoint[0]) / 8.0
          let height = Math.abs(vertex[1] - prevPoint[1]) / 4.0
          newVertices = newVertices.concat(
            curve.map(
              (cv) =>
                new Victor(
                  cv.x * width + vertex[0] / 8.0,
                  cv.y * height + prevPoint[1] / 4.0,
                ),
            ),
          )
        } else {
          // ccwise
          let width = -Math.abs(vertex[0] - prevPoint[0]) / 8.0
          let height = Math.abs(vertex[1] - prevPoint[1]) / 4.0
          newVertices = newVertices.concat(
            curve
              .map(
                (cv) =>
                  new Victor(
                    cv.x * width + prevPoint[0] / 8.0,
                    cv.y * height + vertex[1] / 4.0,
                  ),
              )
              .reverse(),
          )
        }
        newVertices.push(new Victor(vertex[0] / 8.0, vertex[1] / 4.0))
        break
    }
    prevPoint = vertex
  })

  const scale = 0.6
  const offset_y = -0.5
  const scaledVertices = newVertices.map((vertex) => {
    return new Victor(scale * vertex.x, scale * vertex.y + offset_y)
  })
  return {
    maxX: fontSpacing,
    vertices: scaledVertices,
  }
}

const raysolConverter = (vertices) => {
  let newVertices = []
  vertices.forEach((vertex) => {
    newVertices.push(new Victor(vertex[0], vertex[1]))
  })

  return {
    maxX: fontSpacing,
    vertices: newVertices,
  }
}

export const MonospaceFont = (ch) => {
  let upper = ch.toUpperCase()
  // eslint-disable-next-line no-prototype-builtins
  if (billsey.hasOwnProperty(upper)) {
    return billseyConverter(billsey[upper])
  } else {
    return billseyConverter(billsey[" "])
  }
}

export const CursiveFont = (ch) => {
  // eslint-disable-next-line no-prototype-builtins
  if (raysol_cursive.hasOwnProperty(ch)) {
    return raysolConverter(raysol_cursive[ch])
  } else {
    return raysolConverter(raysol_cursive[" "])
  }
}

export const SansSerifFont = (ch) => {
  // eslint-disable-next-line no-prototype-builtins
  if (raysol_cursive.hasOwnProperty(ch)) {
    return raysolConverter(raysol_sanserif[ch])
  } else {
    return raysolConverter(raysol_sanserif[" "])
  }
}
