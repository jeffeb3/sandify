import Victor from 'victor'
import Graph from './Graph'
import { vertexRoundP } from './geometry'

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
  let vertices = []
  let currVertices = [vertex]
  let angle = -Math.PI/2
  let branches = []
  let currBranch

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
      vertex = vertexRoundP(vertex.clone().add({x: -config.side * Math.cos(angle), y: -config.side * Math.sin(angle)}), 2)
      currVertices.push(vertex)
    } else if (char === '[') {
      branches.push({ angle: angle, vertex: vertex })
    } else if (char === ']') {
      currBranch = branches.pop()
      vertex = currBranch.vertex
      angle = currBranch.angle
      vertices.push(currVertices)
      currVertices = [vertex]
    }
  }

  vertices.push(currVertices)

  // build a graph of unique vertices
  let graph = new Graph()
  for(let i=0; i<vertices.length; i++) {
    let branchVertices = vertices[i]

    for(let j=0; j<branchVertices.length; j++) {
      let curr = branchVertices[j]

      graph.addNode(curr)

      if (j > 0) {
        let prev = branchVertices[j-1]
        graph.addEdge(prev, curr)
      }
    }
  }

  // walk the shortest path from the end of each branch back to the start
  // of the next
  let connectedVertices = []
  let keys = []
  for(let i=0; i<vertices.length; i++) {
    let branchVertices = vertices[i]

   if (i > 0) {
     let prevVertices = vertices[i-1]
     let key = branchVertices[0].toString()
     let prevKey = prevVertices[prevVertices.length-1].toString()

     if (!graph.hasEdge(prevKey, key)) {
       let path = graph.dijkstraShortestPath(prevKey, key)

       path.shift()
       path.pop()
       branchVertices = path.concat(branchVertices)
     }
   }

    connectedVertices = connectedVertices.concat(branchVertices)
  }

  return connectedVertices
}
