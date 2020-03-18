import { Polygon } from '../../shapes/polygon/Polygon.js'
import { Circle } from '../../shapes/circle/Circle.js'
import { Star } from '../../shapes/star/Star.js'
import { Heart } from '../../shapes/heart/Heart.js'
import { Reuleaux } from '../../shapes/reuleaux/Reuleaux.js'
import { Epicycloid } from '../../shapes/epicycloid/Epicycloid.js'
import { Hypocycloid } from '../../shapes/hypocycloid/Hypocycloid.js'
import { Rose } from '../../shapes/rose/Rose.js'
import { InputText } from '../../shapes/input_text/InputText.js'
import { V1Engineering } from '../../shapes/v1_engineering/V1Engineering.js'

export const registeredShapes = [Polygon, Star, Circle, Heart, Reuleaux, Epicycloid,
  Hypocycloid, Rose, InputText, V1Engineering];

export const findShape = (name) => {
  return registeredShapes.find(shape => shape.getInfo().name === name)
}
