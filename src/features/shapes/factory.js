import Circle from "./Circle"
import Epicycloid from "./Epicycloid"
import FancyText from "./FancyText"
import FileImport from "./FileImport"
import FractalSpirograph from "./fractal_spirograph/FractalSpirograph"
import Heart from "./Heart"
import Hypocycloid from "./Hypocycloid"
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
  point: Point,
  circlePacker: CirclePacker,
  wiper: Wiper,
  spaceFiller: SpaceFiller,
  noise_wave: NoiseWave,
  fileImport: FileImport,
}

export const getShapeFromType = (type, ...args) => {
  return new shapeFactory[type](args)
}

export const getDefaultShapeType = () => {
  return localStorage.getItem("defaultShape") || "polygon"
}

export const getDefaultShape = () => {
  return getShapeFromType(getDefaultShapeType())
}

export const getShapeSelectOptions = () => {
  const groupOptions = []
  const types = Object.keys(shapeFactory)

  for (const type of types) {
    const shape = getShapeFromType(type)
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
