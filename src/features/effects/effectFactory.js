import FineTuning from "./FineTuning"
import Fisheye from "./Fisheye"
import Loop from "./Loop"
import Mask from "./Mask"
import Noise from "./noise/Noise"
import Track from "./Track"
import Transformer from "./Transformer"
import Warp from "./Warp"

export const effectFactory = {
  loop: Loop,
  transformer: Transformer,
  fisheye: Fisheye,
  fineTuning: FineTuning,
  mask: Mask,
  noise: Noise,
  track: Track,
  warp: Warp,
}

export const getEffect = (type, ...args) => {
  return new effectFactory[type](args)
}

export const getDefaultEffectType = () => {
  return localStorage.getItem("defaultEffect") || "mask"
}

export const getDefaultEffect = () => {
  return getEffect(getDefaultEffectType())
}

export const getEffectSelectOptions = () => {
  const types = Object.keys(effectFactory)

  return types.map((type) => {
    return { value: type, label: getEffect(type).label }
  })
}
