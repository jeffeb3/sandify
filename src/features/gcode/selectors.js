import { createSelector } from 'reselect'
import { getShape } from '../shapes/selectors'

const getApp = state => state.app
const getShapes = state => state.shapes
const getTransforms = state => state.transforms
const getFile = state => state.file
const getGCode = state => state.gcode
const getWiper = state => state.wiper
const getMachine = state => state.machine

export const getComments = createSelector(
  [
      getApp,
      getShapes,
      getTransforms,
      getFile,
      getGCode,
      getWiper,
      getMachine,
  ],
  (app, shapes, transforms, file, gcode, wiperState, machine) => {
    let state = {
      app: app,
      shapes: shapes,
      shape: shapes.byId[shapes.currentId],
      transforms: transforms,
      transform: transforms.byId[shapes.currentId],
      file: file,
      gcode: gcode,
      wiper: wiperState,
      machine: machine
    }

    let comments = []

    comments.push("Created by Sandify")
    comments.push("")
    comments.push("  https://sandify.org")
    comments.push("")
    comments.push("  Sandify Version: " + state.app.sandifyVersion)
    comments.push("")
    comments.push("  Machine Type: " + (state.machine.rectangular ? "Rectangular" : "Polar"))

    if (state.machine.rectangular) {
      comments.push("    MinX: " + state.machine.minX + " MaxX: " + state.machine.maxX + " MinY: " + state.machine.minY + " MaxY: " + state.machine.maxY)
    } else {
      comments.push("    Max Radius: " + state.machine.maxRadius)
      comments.push("    Force Endpoints: " + state.machine.polarEndpoints)
    }

    switch (state.app.input) {
      case 'shapes': // shapes
        const shape = state.shapes.byId[state.shapes.currentId]
        const shapeInfo = getShape(shape).getOptions()

        comments.push("  Content Type: Shapes")
        comments.push("    Starting Size: " + shape.startingSize)
        comments.push("    Offset: X: " + shape.offsetX + " Y: " + shape.offsetY)
        comments.push("    Selected Shape: " + shapeInfo.name)

        Object.entries(shapeInfo).forEach((option) => {
          comments.push("      " + option.title + ": " + shape[option.key])
        })

        comments.push("    Number of Loops: " + state.transform.numLoops)
        comments.push("    Spin: " + state.transform.spinEnabled)
        if (state.transform.spinEnabled) {
          comments.push("      Spin Value: " + state.transform.spinValue)
          comments.push("      Spin Switchbacks: " + state.transform.spinSwitchbacks)
        }
        comments.push("    Grow: " + state.transform.growEnabled)
        if (state.transform.growEnabled) {
          comments.push("      Grow Value: " + state.transform.growValue)
        }
        comments.push("    Track: " + state.transform.trackEnabled)
        if (state.transform.trackEnabled) {
          comments.push("      Track Size: " + state.transform.trackValue)
          comments.push("      Track Length: " + state.transform.trackLength)
          comments.push("      Track Grow: " + state.transform.trackGrowEnabled)
          if (state.transform.trackGrowEnabled) {
            comments.push("          Track Grow Value: " + state.transform.trackGrow)
          }
        }
        break

      case 'wiper':
        comments.push("  Content Type: Wiper")
        comments.push("    Wiper Angle: " + state.wiper.angleDeg)
        comments.push("    Wiper Size: "  + state.wiper.size)
        break

      case 'code': // Theta Rho
        comments.push("  Content Type: ThetaRho")
        comments.push("    Input File: " + state.file.name)
        comments.push("    Zoom: "  + state.file.zoom)
        comments.push("    Aspect Ratio: " + state.file.aspectRatio)
        break

      default: // Dunno
        comments.push("  Content Type: Unknown")
        break
    }

    comments.push("  Path Reversed: " + state.gcode.reverse)
    comments.push("")
    return comments
  }
)
