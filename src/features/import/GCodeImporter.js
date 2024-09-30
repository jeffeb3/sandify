import Importer from "./Importer"
import Toolpath from "gcode-toolpath"

export default class GCodeImporter extends Importer {
  // calls callback, returning an object containing relevant properties
  import(callback) {
    const vertices = []
    const lines = this.text.split("\n")

    // This assumes the line is already trimmed and not empty.
    // The parenthesis isn't perfect, since it usually has a match, but I don't think anyone will
    // care. I think there are firmwares that do this same kind of hack.
    const isComment = (line) => {
      return line.indexOf(";") === 0 || line.indexOf("(") === 0
    }

    const addVertex = (x, y) => {
      vertices.push({ x, y })
    }

    // Ignore initial comments
    for (let ii = 0; ii < lines.length; ii++) {
      let line = lines[ii].trim()
      if (line.length === 0 || isComment(line)) {
        continue
      } else {
        break
      }
    }

    // GCode reader object. More info here:
    // https://github.com/cncjs/gcode-toolpath/blob/master/README.md
    const toolpath = new Toolpath({
      // @param {object} modal The modal object.
      // @param {object} v1 A 3D vector of the start point.
      // @param {object} v2 A 3D vector of the end point.
      addLine: (modal, v1, v2) => {
        if (v1.x !== v2.x || v1.y !== v2.y) {
          addVertex(v2.x, v2.y)
        }
      },
      // @param {object} modal The modal object.
      // @param {object} v1 A 3D vector of the start point.
      // @param {object} v2 A 3D vector of the end point.
      // @param {object} v0 A 3D vector of the fixed point.
      addArcCurve: (modal, v1, v2, v0) => {
        if (v1.x !== v2.x || v1.y !== v2.y) {
          // We can't use arc, we have to go a specific direction (not the shortest path).
          let startTheta = Math.atan2(v1.y - v0.y, v1.x - v0.x)
          let endTheta = Math.atan2(v2.y - v0.y, v2.x - v0.x)
          let deltaTheta = endTheta - startTheta
          const radius = Math.sqrt(
            Math.pow(v2.x - v0.x, 2.0) + Math.pow(v2.y - v0.y, 2.0),
          )
          let direction = 1.0 // Positive, so anticlockwise.

          // Clockwise
          if (modal.motion === "G2") {
            if (deltaTheta > 0.0) {
              endTheta -= 2.0 * Math.PI
              deltaTheta -= 2.0 * Math.PI
            }
            direction = -1.0
          } else if (modal.motion === "G3") {
            // Anti-clockwise
            if (deltaTheta < 0.0) {
              endTheta += 2.0 * Math.PI
              deltaTheta += 2.0 * Math.PI
            }
          }

          // What angle do we need to have a resolution of approx. 0.5mm?
          const arcResolution = 0.5
          const arcLength = Math.abs(deltaTheta) * radius
          const thetaStep = (deltaTheta * arcResolution) / arcLength
          for (
            let theta = startTheta;
            direction * theta <= direction * endTheta;
            theta += thetaStep
          ) {
            addVertex(
              v0.x + radius * Math.cos(theta),
              v0.y + radius * Math.sin(theta),
            )
          }
          // Save the final point, in case our math didn't quite get there.
          addVertex(v2.x, v2.y)
        }
      },
    })

    toolpath.loadFromString(this.text, (err, results) => {
      callback(this, vertices)
    })
  }
}
