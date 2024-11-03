import { centerOnOrigin, dimensions, offset } from "@/common/geometry"
import { getMachine } from "@/features/machines/machineFactory"
import Shape from "../Shape"
import { subtypes, getSubtype } from "./subtypes"
import RectMachine from "@/features/machines/RectMachine"

const hasSetting = (state, setting) => {
  return getSubtype(state.imageSubtype).settings.includes(setting)
}

// a change to clipped brightness can change the aspect ratio; given that this shape
// stretches, we need to alter the dimensions to match to prevent distortion.
const handleClippedBrightnessChange = (model, changes, state) => {
  const currentVertices = model.getVertices({
    shape: state,
  })
  const newVertices = model.getVertices({
    shape: {
      ...state,
      ...changes,
    },
  })

  const cDim = dimensions(currentVertices)
  const nDim = dimensions(newVertices)
  const cAr = cDim.width / cDim.height
  const nAr = nDim.width / nDim.height

  if (!isNaN(nAr) && !isNaN(cAr) && cAr != nAr) {
    const ar = (nAr * state.aspectRatio) / cAr
    changes.aspectRatio = ar

    if (nAr > 1) {
      changes.height = state.height * (state.aspectRatio / ar)
    } else {
      changes.width = state.width * (ar / state.aspectRatio)
    }
  }

  return changes
}

const options = {
  imageSubtype: {
    title: "Type",
    type: "dropdown",
    choices: Object.keys(subtypes),
    onChange: (model, changes, state) => {
      changes.imageFrequency = changes.imageSubtype == "Springs" ? 50 : 150
      return changes
    },
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
  imageBrightnessFilter: {
    title: "Brightness filter",
    type: "slider",
    range: true,
    min: 0,
    max: 255,
    isVisible: (layer, state) => {
      return hasSetting(state, "imageBrightnessFilter")
    },
    onChange: (model, changes, state) => {
      return handleClippedBrightnessChange(model, changes, state)
    },
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

export default class ImageImport extends Shape {
  constructor() {
    super("imageImport")
    this.label = "Import"
    this.usesMachine = true
    this.stretch = true
    this.selectGroup = "import"
    this.randomizable = false
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
        imageMinClippedBrightness: 0,
        imageMaxClippedBrightness: 255,
        imageBrightnessFilter: [0, 255],
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
    const initialVertices = this.getVertices({
      shape: {
        ...this.getInitialState(),
        imageId: props.imageId,
      },
      ...props,
    })
    const dim = dimensions(initialVertices)
    const fit = this.fitLayerDimensionsToMachine(dim, machine)

    return {
      width: fit.width,
      height: fit.height,
      aspectRatio: fit.width / fit.height,
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

    let scale
    if (layerAspectRatio > 1) {
      scale = (machineWidth / layerWidth) * 0.8
    } else {
      scale = (machineHeight / layerHeight) * 0.8
    }

    return {
      width: layerWidth * scale,
      height: layerHeight * scale,
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

    const imageMinClippedBrightness = state.shape.imageBrightnessFilter[0]
    const imageMaxClippedBrightness = state.shape.imageBrightnessFilter[1]
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
      MaxClippedBrightness: imageMaxClippedBrightness,
      MinClippedBrightness: imageMinClippedBrightness,
      width: canvas.width,
      height: canvas.height,
    }

    const subtype = subtypes[imageSubtype] || subtypes["Squiggle"]
    let vertices = subtype.algorithm(config, image)

    vertices = centerOnOrigin(vertices)

    // the algorithm can return vertices outside of original dimensions, so clip them;
    // this is consistent with how plotterfun handles this case.
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
