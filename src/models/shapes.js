import Circle from '../models/Circle'
import Epicycloid from '../models/Epicycloid'
import FileImport from '../models/FileImport'
import Fisheye from '../models/Fisheye'
import Warp from '../models/Warp'
import CirclePacker from '../models/circle_packer/CirclePacker'
import FractalSpirograph from '../models/fractal_spirograph/FractalSpirograph'
// import Freeform from '../models/Freeform'
import Heart from '../models/Heart'
import Hypocycloid from '../models/Hypocycloid'
import InputText from '../models/input_text/InputText'
import FancyText from '../models/FancyText'
import LSystem from '../models/lsystem/LSystem'
import Mask from '../models/Mask'
import Noise from '../models/Noise'
import NoiseWave from '../models/NoiseWave'
import Point from '../models/Point'
import Polygon from '../models/Polygon'
import Reuleaux from '../models/Reuleaux'
import Rose from '../models/Rose'
import SpaceFiller from '../models/space_filler/SpaceFiller'
import Star from '../models/Star'
import TessellationTwist from '../models/tessellation_twist/TessellationTwist'
import V1Engineering from '../models/v1_engineering/V1Engineering'
import Wiper from '../models/Wiper'
import Loop from './Loop'
import Track from './TrackTransform'

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
  warp: new Warp()
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
      if (shape.selectGroup === 'import') {
        // users can't manually select this group
        continue
      } else if (shape.selectGroup === 'effects') {
        // effects are added separately
        // TODO: when effects can be added separately, uncomment the next line
        // continue
      }

      const newOptions = [ optionLabel ]
      groupOptions.push( { label: shape.selectGroup, options: newOptions } )
    }
  }

  return groupOptions
}
