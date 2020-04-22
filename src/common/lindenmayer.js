import Victor from 'victor'

export const onSubtypeChange = (subtype, changes, attrs) => {
  // if we switch back with too many iterations, the code
  // will crash from recursion, so we'll set a ceiling where needed
  if (subtype) {
    let max = subtype.maxIterations
    let min = subtype.minIterations
    let iterations = attrs.iterations || 1

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

export const onMinIterations = (subtype, state) => {
  return (subtype && subtype.minIterations) || 1
}

export const onMaxIterations = (subtype, state) => {
  return (subtype && subtype.maxIterations) || 7
}

// Implements a Lindenmayer system (L-system). See https://en.wikipedia.org/wiki/L-system.
// Adapted from http://bl.ocks.org/nitaku/ce638f8bd5e70cb809e1
export const lsystem = (config) => {
  let input = config.axiom
  let output

  for (let i=0; i<config.iterations; i++) {
    output = ''

    for (let j=0; j<input.length; j++) {
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

export const lsystemPath = (instructions, config) => {
  let vertex = new Victor(0, 0)
  let vertices = [vertex]
  let angle = -Math.PI/2

  if (config.startingAngle) {
    angle = typeof config.startingAngle === 'function' ?
      config.startingAngle(config.iterations) :
      config.startingAngle
  }

  for (let i=0; i<instructions.length; i++) {
    let char = instructions[i]

    if (char === '+') {
      angle += config.angle
    } else if (char === '-') {
      angle -= config.angle
    } else if (config.draw.includes(char)) {
      vertex = vertex.clone().add({x: -config.side * Math.cos(angle), y: -config.side * Math.sin(angle)})
      vertices.push(vertex)
    } else if (char === '[') {
      // to do
    } else if (char === ']') {
      // to do
    }
  }

  return vertices
}
