import FineTuning from "./FineTuning"
import Fisheye from "./Fisheye"
import Loop from "./Loop"
import Mask from "./Mask"
import Noise from "./Noise"
import Track from "./Track"
import Warp from "./Warp"

export const effectFactory = {
  fisheye: new Fisheye(),
  fineTuning: new FineTuning(),
  loop: new Loop(),
  mask: new Mask(),
  noise: new Noise(),
  track: new Track(),
  warp: new Warp(),
}

export const getEffectFromType = (type) => {
  return effectFactory[type]
}

export const getDefaultEffectType = () => {
  const defaultType = localStorage.getItem("defaultEffect")
  return getEffectFromType(defaultType) ? defaultType : "mask"
}

export const getDefaultEffect = () => {
  return effectFactory[getDefaultEffectType()]
}

export const getEffectSelectOptions = () => {
  const types = Object.keys(effectFactory)

  return types.map((type) => {
    return { value: type, label: effectFactory[type].label }
  })
}
