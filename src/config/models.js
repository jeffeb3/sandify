import Circle from "@/models/shapes/Circle"
import CirclePacker from "@/models/shapes/circle_packer/CirclePacker"
import Epicycloid from "@/models/shapes/Epicycloid"
import FancyText from "@/models/shapes/FancyText"
import FileImport from "@/models/shapes/FileImport"
import Fisheye from "@/models/shapes/Fisheye"
import FractalSpirograph from "@/models/shapes/fractal_spirograph/FractalSpirograph"
// import Freeform from "../models/shapes/Freeform"
import Heart from "@/models/shapes/Heart"
import Hypocycloid from "@/models/shapes/Hypocycloid"
import InputText from "@/models/shapes/input_text/InputText"
import LSystem from "@/models/shapes/lsystem/LSystem"
import NoiseWave from "@/models/shapes/NoiseWave"
import Polygon from "@/models/shapes/Polygon"
import Point from "@/models/shapes/Point"
import Reuleaux from "@/models/shapes/Reuleaux"
import Rose from "@/models/shapes/Rose"
import SpaceFiller from "@/models/shapes/space_filler/SpaceFiller"
import Star from "@/models/shapes/Star"
import TessellationTwist from "@/models/shapes/tessellation_twist/TessellationTwist"
import V1Engineering from "@/models/shapes/v1_engineering/V1Engineering"

import FineTuning from "../models/effects/FineTuning"
import Loop from "@/models/effects/Loop"
import Mask from "@/models/effects/Mask"
import Noise from "@/models/effects/Noise"
import Track from "@/models/effects/Track"
import Warp from "@/models/effects/Warp"
import Wiper from "@/models/shapes/Wiper"

/*----------------------------------------------
Supported input shapes
-----------------------------------------------*/
export const registeredModels = {
  polygon: new Polygon(),
  star: new Star(),
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
  // freeform: new Freeform(),
  circle_packer: new CirclePacker(),
  wiper: new Wiper(),
  space_filler: new SpaceFiller(),
  noise_wave: new NoiseWave(),
  file_import: new FileImport(),
  fisheye: new Fisheye(),
  loop: new Loop(),
  track: new Track(),
  mask: new Mask(),
  noise: new Noise(),
  warp: new Warp(),
  fineTuning: new FineTuning(),
}

export const getModel = (type) => {
  return registeredModels[type]
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
  const shapes = getModelDefaults()

  for (const shape of shapes) {
    const optionLabel = { value: shape.id, label: shape.name }
    var found = false

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
      } else if (shape.selectGroup === "effects") {
        // effects are added separately
        // TODO: when effects can be added separately, uncomment the next line
        // continue
      }

      const newOptions = [optionLabel]
      groupOptions.push({ label: shape.selectGroup, options: newOptions })
    }
  }

  return groupOptions
}
