import Circle from '../shapes/Circle'
import Epicycloid from '../shapes/Epicycloid'
import FractalSpirograph from '../shapes/fractal_spirograph/FractalSpirograph'
import Heart from '../shapes/Heart'
import Hypocycloid from '../shapes/Hypocycloid'
import InputText from '../shapes/input_text/InputText'
import LSystem from '../shapes/lsystem/LSystem'
import Polygon from '../shapes/Polygon'
import Reuleaux from '../shapes/Reuleaux'
import Rose from '../shapes/Rose'
import SpaceFiller from '../shapes/space_filler/SpaceFiller'
import Star from '../shapes/Star'
import TessellationTwist from '../shapes/tessellation_twist/TessellationTwist'
import V1Engineering from '../shapes/v1_engineering/V1Engineering'
import Wiper from '../shapes/Wiper'

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
