import React from "react"
import { useDispatch, useSelector } from "react-redux"
import InputOption from "@/components/InputOption"
import DropdownOption from "@/components/DropdownOption"
import CheckboxOption from "@/components/CheckboxOption"
import ToggleButtonOption from "@/components/ToggleButtonOption"
import { updateEffect } from "./effectsSlice"
import EffectLayer from "./EffectLayer"
import { selectSelectedEffect } from "./effectsSlice"

const EffectEditor = ({ id }) => {
  const dispatch = useDispatch()
  const effect = useSelector(selectSelectedEffect)
  const instance = new EffectLayer(effect.type)
  const model = new EffectLayer(effect.type).model
  const effectOptions = instance.getOptions()
  const modelOptions = model.getOptions()

  const handleChange = (attrs) => {
    attrs.id = effect.id
    dispatch(updateEffect(attrs))
  }

  //  const handleRestoreDefaults = () => {
  //    dispatch(restoreDefaults(id))
  //  }

  const getOptionComponent = (model, options, key, label = true) => {
    const option = options[key]
    const props = {
      options,
      key,
      onChange: handleChange,
      optionKey: key,
      data: effect,
      object: model,
      label,
    }

    switch (option.type) {
      case "dropdown":
        return <DropdownOption {...props} />
      case "checkbox":
        return <CheckboxOption {...props} />
      case "togglebutton":
        return <ToggleButtonOption {...props} />
      default:
        return <InputOption {...props} />
    }
  }

  const renderedModelOptions = Object.keys(modelOptions).map((key) => (
    <div key={key}>{getOptionComponent(model, modelOptions, key)}</div>
  ))

  return (
    <div className="pl-1 overflow-hidden flex-grow-1 mt-3 container-fluid pr-0">
      {getOptionComponent(model, effectOptions, "width")}
      {getOptionComponent(model, effectOptions, "height")}
      {renderedModelOptions}
    </div>
  )
}

export default EffectEditor
