//import Circle from "@/models/Circle"
//import CirclePacker from "@/models/circle_packer/CirclePacker"
//import Epicycloid from "@/models/Epicycloid"
//import FancyText from "@/models/FancyText"
//import FileImport from "@/models/FileImport"
//import FractalSpirograph from "@/models/fractal_spirograph/FractalSpirograph"
//import Heart from "@/models/Heart"
//import Hypocycloid from "@/models/Hypocycloid"
//import InputText from "@/models/input_text/InputText"
//import LSystem from "@/models/lsystem/LSystem"
//import NoiseWave from "@/models/NoiseWave"
//import Point from "@/models/Point"
import Polygon from "@/models/Polygon"
//import Reuleaux from "@/models/Reuleaux"
//import Rose from "@/models/Rose"
//import SpaceFiller from "@/models/space_filler/SpaceFiller"
//import Star from "@/models/Star"
//import TessellationTwist from "@/models/tessellation_twist/TessellationTwist"
//import V1Engineering from "@/models/v1_engineering/V1Engineering"
//import Wiper from "@/models/Wiper"

//import FineTuning from "../models/effects/FineTuning"
//import Fisheye from "@/models/effects/Fisheye"
//import Loop from "@/models/effects/Loop"
import Mask from "@/models/effects/Mask"
//import Noise from "@/models/effects/Noise"
//import Track from "@/models/effects/Track"
//import Warp from "@/models/effects/Warp"

export const registeredModels = {
  polygon: new Polygon(),
  /*  star: new Star(),
  circle: new Circle(),
  heart: new Heart(),
  reuleaux: new Reuleaux(),
  epicycloid: new Epicycloid(),
  hypocycloid: new Hypocycloid(),
  rose: new Rose(),
  inputText: new InputText(),
  fancy_text: new FancyText(),
  v1Engineering: new V1Engineering(),
  lsystem: new LSystem(),
  fractal_spirograph: new FractalSpirograph(),
  tessellation_twist: new TessellationTwist(),
  point: new Point(),
  circle_packer: new CirclePacker(),
  wiper: new Wiper(),
  space_filler: new SpaceFiller(),
  noise_wave: new NoiseWave(),
  file_import: new FileImport(),
  fisheye: new Fisheye(),
  loop: new Loop(),
  track: new Track(),
  noise: new Noise(),
  warp: new Warp(),
  fineTuning: new FineTuning(), */
  mask: new Mask(),
}

export const getModelFromType = (type) => {
  return registeredModels[type]
}

export const getDefaultModelType = () => {
  const defaultType = localStorage.getItem("defaultModelType")
  return getModelFromType(defaultType) ? defaultType : "polygon"
}

export const getDefaultModel = () => {
  return registeredModels[getDefaultModelType()]
}

export const getModelDefaults = () => {
  return Object.keys(registeredModels).map((id) => {
    const state = registeredModels[id].getInitialState()
    state.name = registeredModels[id].name
    state.id = id
    return state
  })
}

export const getModelSelectOptions = () => {
  const groupOptions = []
  const types = Object.keys(registeredModels)

  for (const type of types) {
    const model = registeredModels[type]
    const optionLabel = { value: type, label: model.label }

    let found = false
    for (const group of groupOptions) {
      if (group.label === model.selectGroup) {
        found = true
        group.options.push(optionLabel)
      }
    }
    if (!found) {
      if (model.selectGroup === "import") {
        // users can't manually select this group
        continue
      } else if (model.selectGroup === "effects") {
        // effects are added separately
        // TODO: when effects can be added separately, uncomment the next line
        continue
      }

      const newOptions = [optionLabel]
      groupOptions.push({ label: model.selectGroup, options: newOptions })
    }
  }

  return groupOptions
}
