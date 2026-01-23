/* global localStorage */

import FineTuning from "./FineTuning"
import Fisheye from "./Fisheye"
import Loop from "./Loop"
import Mask from "./Mask"
import Noise from "./noise/Noise"
import ProgramCode from "./ProgramCode"
import Track from "./Track"
import Transformer from "./Transformer"
import Warp from "./Warp"
import Voronoi from "./Voronoi"

export const effectFactory = {
  loop: Loop,
  transformer: Transformer,
  fisheye: Fisheye,
  fineTuning: FineTuning,
  mask: Mask,
  programCode: ProgramCode,
  noise: Noise,
  track: Track,
  warp: Warp,
  voronoi: Voronoi,
}

export const getEffect = (type, ...args) => {
  return new effectFactory[type](args)
}

export const getDefaultEffectType = () => {
  const effect = localStorage.getItem("defaultEffect")

  // validate that the effect type exists (it may not if switching branches)
  return effect && effectFactory[effect] ? effect : "mask"
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
