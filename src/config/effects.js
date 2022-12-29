
// effects
import FineTuning from '../models/effects/FineTuning'
import Fisheye from '@/models/effects/Fisheye'
import Loop from '@/models/effects/Loop'
import Mask from '@/models/effects/Mask'
import Noise from '@/models/effects/Noise'
import Track from '@/models/effects/Track'
import Warp from '@/models/effects/Warp'
import Wiper from '@/models/shapes/Wiper'


/*----------------------------------------------
Supported effects
-----------------------------------------------*/
export const registeredEffectModels = {
  loop: new Loop(),
  fisheye: new Fisheye(),
  mask: new Mask(),
  noise: new Noise(),
  warp: new Warp(),
  track: new Track(),
  fineTuning: new FineTuning()
}

export const getEffectModel = (effect) => {
  return registeredEffectModels[effect.type]
}

export const getEffectDefaults = () => {
  return Object.keys(registeredEffectModels).map(id => {
    const state = registeredEffectModels[id].getInitialState()
    state.name = registeredEffectModels[id].type
    state.id = id
    return state
  })
}

export const getEffectSelectOptions = () => {
  const groupOptions = []
  const effects = getEffectDefaults()

  for (const effect of effects) {
    const optionLabel = { value: effect.id, label: effect.name }
    var found = false

    for (const group of groupOptions) {
      if (group.label === effect.selectGroup) {
        found = true
        group.options.push(optionLabel)
      }
    }
    if (!found) {
      const newOptions = [ optionLabel ]
      groupOptions.push( { label: effect.selectGroup, options: newOptions } )
    }
  }

  return groupOptions
}
