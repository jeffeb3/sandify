import Importer from './Importer'

export default class ThetaRhoImporter extends Importer {
  constructor(fileName, text) {
    super(fileName, text)
    this.label = 'ThetaRho'
  }

  // calls callback, returning an object containing relevant properties
  import(callback) {
    let hasVertex = false
    let props = {
      comments: [],
      originalAspectRatio: 1.0,
      fileName: this.fileName
    }

    let lines = this.text.split('\n')
    let thetaRhos = []

    for (let ii = 0; ii < lines.length; ii++) {
      var line = lines[ii].trim()

      if (line.length === 0) {
        // blank lines
        continue
      }

      if (line.indexOf("#") === 0 && !hasVertex) {
        props.comments.push(lines[ii])
      }

      if (line.indexOf("#") !== 0) {
        hasVertex = true

        // This is a point, let's try to read it.
        var pointStrings = line.split(/\s+/)
        if (pointStrings.length !== 2) {
          continue
        }

        thetaRhos.push([parseFloat(pointStrings[0]), parseFloat(pointStrings[1])])
      }
    }

    props.vertices = this.convertToXY(thetaRhos)
    callback(this, props)
  }

  convertToXY(thetaRhos) {
    var vertices = []
    var previous = undefined
    var max_angle = Math.PI / 64.0
    for (let ii = 0; ii < thetaRhos.length; ii++) {
      var next = thetaRhos[ii]
      if (previous) {
        if (Math.abs(next[0] - previous[0]) < max_angle) {
          // These sin, cos elements are inverted. I'm not sure why
          vertices.push({
                        x: previous[1] * Math.sin(previous[0]),
                        y: previous[1] * Math.cos(previous[0])
          })
        } else {
          // We need to do some interpolating.
          let deltaAngle = next[0] - previous[0]
          let rhoStep = max_angle / Math.abs(deltaAngle) * (next[1] - previous[1])
          var rho = previous[1]
          if (deltaAngle > 0.0) {
            var emergency_break = 0
            for (let angle = previous[0]; angle < next[0]; angle += max_angle, rho += rhoStep) {
              vertices.push({
                            x: rho * Math.sin(angle),
                            y: rho * Math.cos(angle)
              })
              if (emergency_break++ > 100000) {
                break
              }
            }
          } else {
            for (let angle = previous[0]; angle > next[0]; angle -= max_angle, rho += rhoStep) {
              vertices.push({
                            x: rho * Math.sin(angle),
                            y: rho * Math.cos(angle)
              })
              if (emergency_break++ > 100000) {
                break
              }
            }
          }
        }
      }
      previous = next
    }
    return vertices
  }
}
