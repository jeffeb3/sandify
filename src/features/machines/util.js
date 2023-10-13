import Victor from "victor"
import { annotateVertices } from "@/common/geometry"
import { getMachine } from "./machineFactory"

// looks for vertices with connect = true. When found, adds vertices that connect that vertex
// with the next one in the array along the machine perimeter. Returns a modified array that
// includes connectors.
export const connectMarkedVerticesAlongMachinePerimeter = (
  vertices,
  machineState,
) => {
  const machine = getMachine(machineState)
  const newVertices = []

  for (let i = 0; i < vertices.length; i++) {
    const vertex = vertices[i]

    newVertices.push(vertex)
    if (vertex.connector) {
      vertex.hidden = false
      vertex.connect = true

      // connect the next two vertices along the machine perimeter
      const next = vertices[i + 1]

      if (next) {
        next.connect = true

        const clipped = machine.clipLine(
          new Victor(vertex.x - machine.sizeX * 2, vertex.y),
          new Victor(vertex.x + machine.sizeX * 2, vertex.y),
        )
        const clipped2 = machine.clipLine(
          new Victor(next.x - machine.sizeX * 2, next.y),
          new Victor(next.x + machine.sizeX * 2, next.y),
        )

        const connector = annotateVertices(
          [
            clipped[1],
            ...machine.tracePerimeter(clipped[1], clipped2[0]),
            clipped2[0],
          ],
          { connect: true },
        )

        newVertices.push(connector)
      }
    }
  }

  return newVertices.flat()
}
