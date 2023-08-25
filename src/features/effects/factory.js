import FineTuning from "./FineTuning"
import Fisheye from "./Fisheye"
import Loop from "./Loop"
import Mask from "./Mask"
import Noise from "./Noise"
import Track from "./Track"
import Transformer from "./Transformer"
import Warp from "./Warp"

export const effectFactory = {
  fisheye: Fisheye,
  fineTuning: FineTuning,
  loop: Loop,
  mask: Mask,
  noise: Noise,
  track: Track,
  transformer: Transformer,
  warp: Warp,
}

export const getEffectFromType = (type, ...args) => {
  return new effectFactory[type](args)
}

export const getDefaultEffectType = () => {
  return localStorage.getItem("defaultEffect") || "mask"
}

export const getDefaultEffect = () => {
  return getEffectFromType(getDefaultEffectType())
}

export const getEffectSelectOptions = () => {
  const types = Object.keys(effectFactory)

  return types.map((type) => {
    return { value: type, label: getEffectFromType(type).label }
  })
}
