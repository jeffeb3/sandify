import Circle from '../models/Circle'
import Epicycloid from '../models/Epicycloid'
import FractalSpirograph from '../models/fractal_spirograph/FractalSpirograph'
import Heart from '../models/Heart'
import Hypocycloid from '../models/Hypocycloid'
import InputText from '../models/input_text/InputText'
import LSystem from '../models/lsystem/LSystem'
import Polygon from '../models/Polygon'
import Reuleaux from '../models/Reuleaux'
import Rose from '../models/Rose'
import SpaceFiller from '../models/space_filler/SpaceFiller'
import Star from '../models/Star'
import TessellationTwist from '../models/tessellation_twist/TessellationTwist'
import V1Engineering from '../models/v1_engineering/V1Engineering'
import Wiper from '../models/Wiper'

/*----------------------------------------------
Supported input shapes
-----------------------------------------------*/
export const registeredShapes = {
  polygon: new Polygon(),
  star: new Star(),
  circle: new Circle(),
  heart: new Heart(),
  reuleaux: new Reuleaux(),
  epicycloid: new Epicycloid(),
  hypocycloid: new Hypocycloid(),
  rose: new Rose(),
  inputText: new InputText(),
  v1Engineering: new V1Engineering(),
  lsystem: new LSystem(),
  fractal_spirograph: new FractalSpirograph(),
  tessellation_twist: new TessellationTwist(),
  wiper: new Wiper(),
  space_filler: new SpaceFiller()
}

export const getShape = (layer) => {
  return registeredShapes[layer.type]
}

export const getShapeDefaults = () => {
  return Object.keys(registeredShapes).map(id => {
    const state = registeredShapes[id].getInitialState()
    state.name = registeredShapes[id].name
    state.id = id
    return state
  })
}

export const getShapeSelectOptions = () => {
  const groupOptions = []
  const shapes = getShapeDefaults()

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
      const newOptions = [ optionLabel ]
      groupOptions.push( { label: shape.selectGroup, options: newOptions } )
    }
  }

  return groupOptions
}
