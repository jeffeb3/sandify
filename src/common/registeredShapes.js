import Polygon from '../shapes/Polygon'
import Circle from '../shapes/Circle'
import Star from '../shapes/Star'
import Heart from '../shapes/Heart'
import Reuleaux from '../shapes/Reuleaux'
import Epicycloid from '../shapes/Epicycloid'
import Hypocycloid from '../shapes/Hypocycloid'
import Rose from '../shapes/Rose'
import InputText from '../shapes/input_text/InputText'
import Wiper from '../shapes/Wiper'
import V1Engineering from '../shapes/v1_engineering/V1Engineering'

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
  v1Engineering: new V1Engineering(),
  inputText: new InputText(),
  wiper: new Wiper()
}
