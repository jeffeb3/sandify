import { CursiveFont, SansSerifFont, MonospaceFont } from "./Fonts"
import Victor from "victor"
import Shape from "@/features/shapes/Shape"
import { arc, dimensions } from "@/common/geometry"
import { connectMarkedVerticesAlongMachinePerimeter } from "@/features/machines/util"

const options = {
  inputText: {
    title: "Text",
    type: "textarea",
  },
  inputFont: {
    title: "Font",
    type: "dropdown",
    choices: ["Cursive", "Sans Serif", "Monospace"],
  },
  rotateDir: {
    title: "Rotate",
    type: "dropdown",
    choices: ["Top", "Center", "Bottom"],
  },
}

function getMaxX(points) {
  // Measure the width of the line
  let maxX = 0

  points.forEach((point) => {
    if (point.x > maxX) {
      maxX = point.x
    }
  })

  return maxX
}

export default class InputText extends Shape {
  constructor() {
    super("inputText")
    this.stretch = true
    this.label = "Text"
    this.usesMachine = true
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        inputText: "Sandify",
        inputFont: "Cursive",
        rotateDir: "Center",
        maintainAspectRatio: true,
      },
    }
  }

  getVertices(state) {
    let points = []
    let prevLetter = ""
    let x = 0.0
    let lines = []
    let textPoints = []

    for (let chi = 0; chi < state.shape.inputText.length; chi++) {
      let nextLetter = state.shape.inputText[chi]

      if (
        prevLetter === "b" ||
        prevLetter === "v" ||
        prevLetter === "o" ||
        prevLetter === "w"
      ) {
        // Save this letter before we possibly add in a '*'
        prevLetter = nextLetter

        if (
          nextLetter.search("[a-z]+") !== -1 &&
          state.shape.inputFont === "Cursive"
        ) {
          nextLetter = nextLetter + "*"
        }
      } else {
        prevLetter = nextLetter
      }

      if (nextLetter === "\n") {
        // New line
        lines.push(points)
        points = []
        x = 0.0
        continue
      }

      let shape = undefined

      if (state.shape.inputFont === "Cursive") {
        shape = CursiveFont(nextLetter)
      } else if (state.shape.inputFont === "Sans Serif") {
        shape = SansSerifFont(nextLetter)
      } else if (state.shape.inputFont === "Monospace") {
        shape = MonospaceFont(nextLetter)
      } else {
        // Internal error, but I'm going to just recover
        shape = CursiveFont(nextLetter)
      }

      // TODO add in the "Kern" here.
      for (let vi = 0; vi < shape.vertices.length; vi++) {
        points.push(new Victor(shape.vertices[vi].x + x, shape.vertices[vi].y))
      }
      x += shape.vertices[shape.vertices.length - 1].x
    }
    // Save the last line we were working on.
    lines.push(points)

    // The height of a row of text, including the space above.
    const maxY = 2.4

    if (state.shape.rotateDir === "Center") {
      let y = ((lines.length - 1) * maxY) / 2.0

      // Capture some wrap around points, to connect the lines.
      lines.forEach((points, i) => {
        let maxX = getMaxX(points)
        let widthOffset = maxX / 2.0

        // offset the line's vertices
        points.forEach((point) => {
          point.x = point.x - widthOffset
          point.y = point.y + y
        })

        textPoints = [...textPoints, ...points]

        if (i > 0) {
          // mark this vertex; we will connect to the next vertice along the machine perimeter
          // once all other transformations have happened
          const prevPoints = lines[i - 1]
          const prev = prevPoints[prevPoints.length - 1]

          if (prev) {
            prev.connector = true
            prev.hidden = true // don't render this line in the preview
          }
        }
        y -= maxY * 0.9
      })
    } else {
      // This variable controls "Top" vs. "Bottom"
      let direction = 1.0

      if (state.shape.rotateDir === "Bottom") {
        direction = -1.0
        lines.reverse()
      }

      // Some constants to rotate the letters.
      //
      // The "lines" object contains lines of words, in vertices.
      // The vertices are in X, Y, the X starts at 0, the Y goes between -something and +something.
      // The middle of the word is about at Y=0.
      //
      // We want the words to follow around a circle. We want them to stay about the same size, as
      // if they were plotted in a line. We want them to be centered.
      //
      // r is the radius, theta is the angle.
      // rPerY is the multiplier to get from Y to r.
      // thetaPerX is the multiplier to get from X to theta.
      //
      // The Max is based on how far away from the center we start.
      //
      // Offset is because we want to start the row far away from the center.
      //
      // thetaCenter is how far off from the theta=0 we start the words.
      //
      const maxRPerY = 0.8
      let rPerY = direction * maxRPerY
      let thetaCenter = (direction * Math.PI) / 2.0
      const maxROffset = maxY * 2.0
      let rOffset = maxROffset
      const rOffsetPerLine = rOffset / lines.length
      let thetaPerX = -rPerY / rOffset

      // This captures the previous angle, so we can track around for the next line.
      let lastTheta

      lines.forEach((points) => {
        let maxX = getMaxX(points)

        // This widthOffset is in X.
        let widthOffset = maxX / 2.0

        // Scale the size of the words to fit within one circle.
        if (Math.PI * 2.0 < Math.abs(thetaPerX * maxX)) {
          // We are going to roll all the way around
          thetaPerX = (direction * -Math.PI * 2.0) / maxX
          rPerY = -thetaPerX * rOffset
        }

        // Add in the connector points (if we have any)
        if (lastTheta) {
          let endTheta = thetaCenter + thetaPerX * -widthOffset

          // Get the Y value of the first point in the next (this) line.
          let r = rOffset + rPerY * 0.0

          if (points.length > 0) {
            r = rOffset + rPerY * points[0].y
          }

          textPoints = [...textPoints, ...arc(r, lastTheta, endTheta)]
        }

        // Transform the points and add them to textPoints.
        textPoints = [
          ...textPoints,
          ...points.map((point) => {
            const r = rOffset + rPerY * point.y
            lastTheta = thetaCenter + thetaPerX * (point.x - widthOffset)
            return new Victor(r * Math.cos(lastTheta), r * Math.sin(lastTheta))
          }),
        ]

        // Set up for the next line.
        rOffset -= rOffsetPerLine
        rPerY = direction * Math.sqrt((maxRPerY * rOffset) / maxROffset)
        thetaPerX = -rPerY / rOffset
      })
    }

    const scale = 2.5 // to normalize starting size

    textPoints.forEach((point) => point.multiply({ x: scale, y: scale }))

    return textPoints
  }

  // After transformations are complete, connect words along perimeter.
  finalizeVertices(vertices, state) {
    if (!state.shape.dragging) {
      return connectMarkedVerticesAlongMachinePerimeter(vertices, state.machine)
    } else {
      return vertices
    }
  }

  // hook to modify updates to a layer
  handleUpdate(layer, changes) {
    if (
      changes.inputText !== undefined ||
      changes.inputFont ||
      changes.rotateDir
    ) {
      const newProps = {
        ...layer,
        inputText: changes.inputText || "a",
        inputFont: changes.inputFont || layer.inputFont,
      }
      const oldProps = {
        ...layer,
        inputText: layer.inputText || "a",
      }
      const oldVertices = this.getVertices({ shape: oldProps, creating: true })
      const vertices = this.getVertices({ shape: newProps, creating: true })
      const { width: oldWidth, height: oldHeight } = dimensions(oldVertices)
      const { width, height } = dimensions(vertices)

      changes.width =
        oldWidth === 0 ? this.startingWidth : (layer.width * width) / oldWidth
      changes.height =
        oldHeight == 0
          ? this.startingHeight
          : (layer.height * height) / oldHeight
      changes.aspectRatio = changes.width / layer.height
    }
  }

  getOptions() {
    return options
  }
}
