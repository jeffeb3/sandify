import { CursiveFont, SansSerifFont, MonospaceFont } from './Fonts'
import { Vertex } from '../../common/Geometry'
import Shape, { shapeOptions } from '../Shape'

const options = {
  ...shapeOptions,
  ...{
    inputText: {
      title: 'Text',
      type: 'textarea',
    },
    inputFont: {
      title: 'Font',
      type: 'dropdown',
      choices: ['Cursive', 'Sans Serif', 'Monospace'],
    },
    rotateDir: {
      title: 'Rotate',
      type: 'dropdown',
      choices: ['Top', 'Center', 'Bottom'],
    },
  }
}

function getMaxX(points) {
  // Measure the width of the line
  let maxX = 0
  points.forEach( (point) => {
    if (point.x > maxX) {
      maxX = point.x
    }
  })
  return maxX
}

export default class InputText extends Shape {
  constructor() {
    super('Text')
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        type: 'inputText',
        inputText: 'Sandify',
        inputFont: 'Cursive',
        rotateDir: 'Center',
        repeatEnabled: false,
        startingSize: 25
      }
    }
  }

  getVertices(state) {
    let points = []
    let prevLetter = ''
    let x = 0.0
    let lines = []
    for (let chi = 0; chi < state.shape.inputText.length; chi++) {
      var nextLetter = state.shape.inputText[chi]
      if (prevLetter === 'b' || prevLetter === 'v' || prevLetter === 'o' || prevLetter === 'w') {
        // Save this letter before we possibly add in a '*'
        prevLetter = nextLetter
        if (nextLetter.search('[a-z]+') !== -1 && state.shape.inputFont === 'Cursive')
        {
          nextLetter = nextLetter + '*'
        }
      }
      else {
        prevLetter = nextLetter
      }

      if (nextLetter === '\n') {
        // New line
        lines.push(points)
        points = []
        x = 0.0
        continue
      }

      var shape = undefined
      if (state.shape.inputFont === 'Cursive') {
        shape = CursiveFont(nextLetter)
      } else if (state.shape.inputFont === 'Sans Serif') {
        shape = SansSerifFont(nextLetter)
      } else if (state.shape.inputFont === 'Monospace') {
        shape = MonospaceFont(nextLetter)
      } else {
        // Internal error, but I'm going to just recover
        shape = CursiveFont(nextLetter)
      }

      // TODO add in the "Kern" here.
      for (let vi = 0; vi < shape.vertices.length; vi++) {
        points.push(Vertex(shape.vertices[vi].x + x, shape.vertices[vi].y))
      }
      x += shape.vertices[shape.vertices.length-1].x
    }
    lines.push(points)

    // The height of a row of text, including the space above.
    const maxY = 2.4

    if (state.shape.rotateDir === 'Center') {
      // Starting Y offset
      let y = (lines.length - 1) * maxY / 2.0
      let textPoints = []

      // Capture some wrap around points, to connect the lines.
      let connectorPoints = []
      lines.forEach( (points) => {
        let maxX = getMaxX(points)
        let widthOffset = maxX / 2.0

        // Add in the connector points (if we have any)
        textPoints = [...textPoints, ...connectorPoints]
        connectorPoints = []

        // offset the line's vertices
        textPoints = [...textPoints, ...points.map( (point) => {
          return Vertex(point.x - widthOffset, point.y + y)
        })]

        // Add in some points way off, so to wrap around for this line.
        connectorPoints.push(Vertex(1e9, y))
        connectorPoints.push(Vertex(1e9, -1e9))
        connectorPoints.push(Vertex(-1e9, -1e9))
        y -= maxY
        connectorPoints.push(Vertex(-1e9, y))
      })
      return textPoints
    } else {
      // These variables control "Top" vs. "Bottom"
      let rDir = 1.0
      let thetaDir = 1.0
      if (state.shape.rotateDir === 'Bottom') {
        rDir = -1.0
        thetaDir = -1.0
      }

      // These are the vertices we will be using.
      let textPoints = []

      // Some constants to rotate the letters.
      const maxRPerY = 0.8
      let rPerY = rDir * maxRPerY
      let thetaCenter = thetaDir * Math.PI / 2.0
      const maxROffset = maxY * 2.0
      let rOffset = maxROffset
      const rOffsetPerLine = rOffset / lines.length
      let thetaPerX = -rPerY / rOffset

      // This captures the previous angle, so we can track around for the next line.
      let lastTheta
      lines.forEach( (points) => {
        let maxX = getMaxX(points)
        let widthOffset = maxX / 2.0
        if (Math.PI * 2.0 < Math.abs(thetaPerX * maxX)) {
          // We are going to roll all the way around
          thetaPerX = thetaDir * -Math.PI * 2.0 / maxX
          rPerY = -thetaPerX * rOffset
        }

        // Add in the connector points (if we have any)
        if (lastTheta) {
          let endTheta = thetaCenter + thetaPerX * -widthOffset
          if (thetaDir * lastTheta < thetaDir * endTheta) {
            lastTheta += thetaDir * 2.0 * Math.PI
          }
          let r = rOffset + rPerY * 0.0
          if (points.length > 0) {
            r = rOffset + rPerY * points[0].y
          }

          for (let theta = lastTheta; thetaDir * theta > thetaDir * endTheta; theta -= thetaDir * 0.01) {
            textPoints.push(Vertex(r * Math.cos(theta), r * Math.sin(theta)))
          }
        }

        textPoints = [...textPoints, ...points.map( (point) => {
          const r = rOffset + rPerY * point.y
          lastTheta = thetaCenter + thetaPerX * (point.x - widthOffset)
          return Vertex(r * Math.cos(lastTheta), r * Math.sin(lastTheta))
        })]
        rOffset -= rOffsetPerLine
        rPerY = rDir * Math.sqrt(maxRPerY * rOffset / maxROffset)
        thetaPerX = -rPerY / rOffset
      })
      return textPoints
    }
  }

  getOptions() {
    return options
  }
}
