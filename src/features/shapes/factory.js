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
  polygon: new Polygon(),
  star: new Star(),
  circle: new Circle(),
  heart: new Heart(),
  reuleaux: new Reuleaux(),
  epicycloid: new Epicycloid(),
  hypocycloid: new Hypocycloid(),
  rose: new Rose(),
  inputText: new InputText(),
  fancyText: new FancyText(),
  v1Engineering: new V1Engineering(),
  lsystem: new LSystem(),
  fractalSpirograph: new FractalSpirograph(),
  tessellationTwist: new TessellationTwist(),
  point: new Point(),
  circlePacker: new CirclePacker(),
  wiper: new Wiper(),
  spaceFiller: new SpaceFiller(),
  noise_wave: new NoiseWave(),
  fileImport: new FileImport(),
}

export const getShapeFromType = (type) => {
  return shapeFactory[type]
}

export const getDefaultShapeType = () => {
  const defaultType = localStorage.getItem("defaultShape")
  return getShapeFromType(defaultType) ? defaultType : "polygon"
}

export const getDefaultShape = () => {
  return shapeFactory[getDefaultShapeType()]
}

export const getShapeSelectOptions = () => {
  const groupOptions = []
  const types = Object.keys(shapeFactory)

  for (const type of types) {
    const shape = shapeFactory[type]
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
