import { getMachine } from "@/features/machines/machineFactory"
import Shape from "../Shape"
import { subtypes } from "./subtypes"
import { centerOnOrigin } from "@/common/geometry"

const options = {
  imageSubtype: {
    title: "Type",
    type: "dropdown",
    choices: Object.keys(subtypes),
  },
  imageFrequency: {
    title: "Frequency",
    min: 5,
    max: 256,
  },
  imageLineCount: {
    title: "Line count",
    min: 10,
    max: 200,
    step: 2,
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
  },
  imageModulation: {
    title: "Modulation",
    type: "togglebutton",
    choices: ["AM", "FM", "both"],
    isVisible: (layer, state) => {
      return state.imageSubtype == "squiggle"
    },
  },
  imagePolygon: {
    title: "Polygon (sides)",
    min: 3,
    max: 8,
    isVisible: (layer, state) => {
      return state.imageSubtype == "polyspiral"
    },
  },
  imageSpacing: {
    title: "Spacing",
    min: 1,
    max: 5,
    step: 0.5,
    isVisible: (layer, state) => {
      return state.imageSubtype == "polyspiral"
    },
  },
  imageContrast: {
    title: "Contrast",
    min: -100.0,
    max: 100.0,
  },
  imageBrightness: {
    title: "Brightness",
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
        imageFrequency: 22,
        imageLineCount: 50,
        imageAmplitude: 1,
        imageSampling: 1,
        imageModulation: "both",
        imageContrast: 0,
        imageBrightness: 0,
        imageInverted: false,
        imagePolygon: 4,
        imageSpacing: 1,
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
      width: canvas.width,
      height: canvas.height,
    }

    const lines = []
    let reverse = false

    subtypes[imageSubtype](config, image).forEach((line) => {
      if (reverse) {
        line = line.reverse()
      }
      lines.push(line)
      //      reverse = !reverse
    })

    return centerOnOrigin(lines.flat())
  }

  getOptions() {
    return options
  }
}
