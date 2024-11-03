import Circle from "./Circle"
import Epicycloid from "./Epicycloid"
import FancyText from "./FancyText"
import LayerImport from "./LayerImport"
import FractalSpirograph from "./fractal_spirograph/FractalSpirograph"
import Heart from "./Heart"
import Hypocycloid from "./Hypocycloid"
import ImageImport from "./image_import/ImageImport"
import InputText from "./input_text/InputText"
import LSystem from "./lsystem/LSystem"
import Point from "./Point"
import Polygon from "./Polygon"
import Reuleaux from "./Reuleaux"
import Rose from "./Rose"
import Star from "./Star"
import TessellationTwist from "./tessellation_twist/TessellationTwist"
import V1Engineering from "./v1_engineering/V1Engineering"
import CirclePacker from "./circle_packer/CirclePacker"
import NoiseWave from "./NoiseWave"
import SpaceFiller from "./space_filler/SpaceFiller"
import Voronoi from "./Voronoi"
import Wiper from "./Wiper"

export const shapeFactory = {
  polygon: Polygon,
  star: Star,
  circle: Circle,
  heart: Heart,
  reuleaux: Reuleaux,
  epicycloid: Epicycloid,
  hypocycloid: Hypocycloid,
  rose: Rose,
  inputText: InputText,
  fancyText: FancyText,
  v1Engineering: V1Engineering,
  lsystem: LSystem,
  fractalSpirograph: FractalSpirograph,
  tessellationTwist: TessellationTwist,
  voronoi: Voronoi,
  point: Point,
  circlePacker: CirclePacker,
  wiper: Wiper,
  spaceFiller: SpaceFiller,
  noise_wave: NoiseWave,
  fileImport: LayerImport,
  imageImport: ImageImport,
}

export const getShape = (type, ...args) => {
  return new shapeFactory[type](args)
}

export const getDefaultShapeType = () => {
  const shape = localStorage.getItem("defaultShape")

  // minor hack: fancy text relies on fonts being loaded, so it can't be used for initial
  // state when the app loads
  return shape && shape !== "fancyText" ? shape : "polygon"
}

export const getDefaultShape = () => {
  return getShape(getDefaultShapeType())
}

export const getShapeSelectOptions = () => {
  const groupOptions = []
  const types = Object.keys(shapeFactory)

  for (const type of types) {
    const shape = getShape(type)
    const optionLabel = { value: type, label: shape.label }

    let found = false
    for (const group of groupOptions) {
      if (group.label === shape.selectGroup) {
        found = true
        group.options.push(optionLabel)
      }
    }
    if (!found) {
      if (shape.selectGroup === "import") {
        // users can't manually select this group
        continue
      }

      const newOptions = [optionLabel]
      groupOptions.push({ label: shape.selectGroup, options: newOptions })
    }
  }

  return groupOptions
}
