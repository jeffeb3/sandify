import { centerOnOrigin, dimensions, offset } from "@/common/geometry"
import { getMachine } from "@/features/machines/machineFactory"
import Shape from "../Shape"
import { subtypes, getSubtype } from "./subtypes"
import RectMachine from "@/features/machines/RectMachine"

const hasSetting = (state, setting) => {
  return getSubtype(state.imageSubtype).settings.includes(setting)
}

const options = {
  imageSubtype: {
    title: "Type",
    type: "dropdown",
    choices: Object.keys(subtypes),
  },
  imagePolygon: {
    title: "Polygon (sides)",
    min: 3,
    max: 8,
    isVisible: (layer, state) => {
      return hasSetting(state, "imagePolygon")
    },
  },
  imageFrequency: {
    title: "Frequency",
    min: 5,
    max: 256,
    isVisible: (layer, state) => {
      return hasSetting(state, "imageFrequency")
    },
  },
  imageLineCount: {
    title: "Line count",
    min: 10,
    max: 200,
    step: 2,
    isVisible: (layer, state) => {
      return hasSetting(state, "imageLineCount")
    },
  },
  imageAmplitude: {
    title: "Amplitude",
    min: 0.1,
    max: 5,
    step: 0.1,
  },
  imageSampling: {
    title: "Sampling",
    min: 0.5,
    max: 2.9,
    step: 0.1,
    isVisible: (layer, state) => {
      return hasSetting(state, "imageSampling")
    },
  },
  imageSpacing: {
    title: "Spacing",
    min: 1,
    max: 5,
    step: 0.5,
    isVisible: (layer, state) => {
      return hasSetting(state, "imageSpacing")
    },
  },
  imageModulation: {
    title: "Modulation",
    type: "togglebutton",
    choices: ["AM", "FM", "both"],
    isVisible: (layer, state) => {
      return hasSetting(state, "imageModulation")
    },
  },
  imageDirection: {
    title: "Direction",
    type: "togglebutton",
    choices: ["clockwise", "counterclockwise"],
    isVisible: (layer, state) => {
      return hasSetting(state, "imageDirection")
    },
  },
  imageStepSize: {
    title: "Step size",
    min: 1,
    max: 20,
    step: 0.1,
    isVisible: (layer, state) => {
      return hasSetting(state, "imageStepSize")
    },
  },
  imageAngle: {
    title: "Angle",
    min: 0,
    max: 360,
    isVisible: (layer, state) => {
      return hasSetting(state, "imageAngle")
    },
  },
  imageBrightness: {
    title: "Brightness",
    type: "slider",
    min: -100.0,
    max: 100.0,
  },
  imageContrast: {
    title: "Contrast",
    type: "slider",
    min: -100.0,
    max: 100.0,
  },
  imageInverted: {
    title: "Inverted",
    type: "checkbox",
  },
}

export default class imageImport extends Shape {
  constructor() {
    super("imageImport")
    this.label = "Import"
    this.usesMachine = true
    this.stretch = true
    this.selectGroup = "import"
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        imageSubtype: "squiggle",
        imageFrequency: 150,
        imageLineCount: 50,
        imageAmplitude: 1,
        imageSampling: 1,
        imageModulation: "both",
        imageContrast: 0,
        imageBrightness: 0,
        imageInverted: false,
        imagePolygon: 4,
        imageSpacing: 1,
        imageDirection: "clockwise",
        imageStepSize: 5,
        imageAngle: 0,
      },
    }
  }

  initialDimensions(props) {
    if (!props) {
      // undefined during import integrity checks
      return {
        width: 0,
        height: 0,
        aspectRatio: 1,
      }
    }

    const machine = getMachine(props.machine)
    const dimensions = this.fitLayerDimensionsToMachine(props, machine)

    return {
      width: dimensions.width,
      height: dimensions.height,
      aspectRatio: 1,
    }
  }

  // if the layer dimensions don't fit inside machine bounds, resize them while
  // maintaining aspect ratio
  fitLayerDimensionsToMachine(layer, machine) {
    const { width: machineWidth, height: machineHeight } = machine
    const { width: layerWidth, height: layerHeight } = layer

    if (layerWidth <= machineWidth && layerHeight <= machineHeight) {
      return layer
    }

    const layerAspectRatio = layerWidth / layerHeight
    const machineAspectRatio = machineWidth / machineHeight

    if (layerAspectRatio > machineAspectRatio) {
      return {
        width: machineWidth * 0.8,
        height: (machineWidth * 0.8) / layerAspectRatio,
      }
    } else {
      return {
        width: machineHeight * 0.8 * layerAspectRatio,
        height: machineHeight * 0.8,
      }
    }
  }

  getVertices(state) {
    const {
      imageId,
      imageSubtype,
      imageFrequency,
      imageLineCount,
      imageAmplitude,
      imageSampling,
      imageModulation,
      imageContrast,
      imageBrightness,
      imageInverted,
      imagePolygon,
      imageSpacing,
      imageDirection,
      imageStepSize,
      imageAngle,
    } = state.shape
    const canvas = document.getElementById(`${imageId}-canvas`)

    if (!canvas) {
      return []
    }

    const ctx = canvas.getContext("2d", {
      willReadFrequently: true,
    })
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const config = {
      Frequency: imageFrequency,
      LineCount: imageLineCount,
      Amplitude: imageAmplitude,
      Sampling: imageSampling,
      Contrast: imageContrast,
      Brightness: imageBrightness,
      MinBrightness: 0,
      MaxBrightness: 255,
      Modulation: imageModulation,
      Inverted: imageInverted,
      Polygon: imagePolygon,
      Spacing: imageSpacing,
      Direction: imageDirection,
      Angle: imageAngle,
      StepSize: imageStepSize,
      width: canvas.width,
      height: canvas.height,
    }

    const subtype = subtypes[imageSubtype] || subtypes["Squiggle"]
    const algorithm = subtype.algorithm
    let vertices = algorithm(config, image)

    vertices = centerOnOrigin(vertices)
    vertices = this.clipAtTop(canvas, vertices)

    return vertices
  }

  clipAtTop(canvas, vertices) {
    const dim = dimensions(vertices)

    vertices = vertices.map((vertex) => {
      return offset(vertex, 0, (canvas.height - dim.height) / 2)
    })

    const machine = new RectMachine({
      minX: 0,
      maxX: canvas.width,
      minY: 0,
      maxY: canvas.height,
    })

    vertices = machine.polish(vertices)

    return vertices.map((vertex) => {
      return offset(vertex, 0, (dim.height - canvas.height) / 2)
    })
  }

  getOptions() {
    return options
  }
}
