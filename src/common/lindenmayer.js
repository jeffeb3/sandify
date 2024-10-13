import Victor from "victor"
import { vertexRoundP, cloneVertex } from "./geometry"

export const onSubtypeChange = (subtype, changes, attrs) => {
  // if we switch back with too many iterations, the code
  // will crash from recursion, so we'll set a ceiling where needed
  if (subtype) {
    let max = subtype.maxIterations
    let min = subtype.minIterations
    let iterations = changes.iterations || attrs.iterations || 1

    if (max) {
      iterations = Math.min(iterations, max)
    }

    if (min) {
      iterations = Math.max(iterations, min)
    }

    changes.iterations = iterations
  }

  return changes
}

export const onMinIterations = (subtype) => {
  return (subtype && subtype.minIterations) || 1
}

export const onMaxIterations = (subtype) => {
  return (subtype && subtype.maxIterations) || 7
}

// Implements a Lindenmayer system (L-system). See https://en.wikipedia.org/wiki/L-system.
// Adapted from http://bl.ocks.org/nitaku/ce638f8bd5e70cb809e1. No license was specified.
export const lsystem = (config) => {
  let input = config.axiom
  let output

  for (let i = 0; i < config.iterations; i++) {
    output = ""

    for (let j = 0; j < input.length; j++) {
      let char = input[j]

      if (config.rules[char] !== undefined) {
        output += config.rules[char]
      } else {
        output += char
      }
    }
    input = output
  }
  return output
}

const lsystemDraw = (vertex, angle, config) => {
  return vertexRoundP(
    cloneVertex(vertex).add({
      x: -config.side * Math.cos(angle),
      y: -config.side * Math.sin(angle),
    }),
    2,
  )
}

export const lsystemPath = (instructions, config) => {
  let vertex = new Victor(0, 0)
  let currVertices = [vertex]
  let angle = -Math.PI / 2

  if (config.startingAngle) {
    angle =
      typeof config.startingAngle === "function"
        ? config.startingAngle(config.iterations)
        : config.startingAngle
  }

  // This will store the previous return paths we are not working on.
  let returnPaths = []
  for (let i = 0; i < instructions.length; i++) {
    let char = instructions[i]

    if (char === "+") {
      angle += config.angle
      if (returnPaths.length) {
        returnPaths.slice(-1)[0].push("-")
      }
    } else if (char === "-") {
      angle -= config.angle
      if (returnPaths.length) {
        returnPaths.slice(-1)[0].push("+")
      }
    } else if (config.draw.includes(char)) {
      vertex = lsystemDraw(vertex, angle, config)
      currVertices.push(vertex)
      if (returnPaths.length) {
        returnPaths.slice(-1)[0].push("B")
      }
    } else if (char === "[") {
      // open a branch
      returnPaths.push([])
    } else if (char === "]") {
      // Return to the beginning of the branch
      let returnPath = returnPaths.pop().reverse()

      for (let j = 0; j < returnPath.length; j++) {
        let revChar = returnPath[j]

        if (revChar === "+") {
          angle += config.angle
        } else if (revChar === "-") {
          angle -= config.angle
        } else if (revChar === "B") {
          // Reverse Draw
          vertex = lsystemDraw(vertex, angle + Math.PI, config)
          currVertices.push(vertex)
        }
      }
    }
  }

  return currVertices
}
