import React from "react"
import { useDispatch, useSelector } from "react-redux"
import { Row, Col } from "react-bootstrap"
import Select from "react-select"
import InputOption from "@/components/InputOption"
import DropdownOption from "@/components/DropdownOption"
import CheckboxOption from "@/components/CheckboxOption"
import ToggleButtonOption from "@/components/ToggleButtonOption"
import { getEffectSelectOptions } from "@/features/effects/factory"
import { updateEffect } from "./effectsSlice"
import EffectLayer from "./EffectLayer"
import { selectCurrentEffect } from "./effectsSlice"

const EffectEditor = ({ id }) => {
  const dispatch = useDispatch()
  const effect = useSelector(selectCurrentEffect)
  const model = new EffectLayer(effect.type).model
  const modelOptions = model.getOptions()
  const selectOptions = getEffectSelectOptions()
  const selectedOption = {
    value: model.type,
    label: model.label,
  }

  //  const handleChangeType = (selected) => {
  //    dispatch(changeModelType({ id, type: selected.value }))
  //  }

  const handleChange = (attrs) => {
    attrs.id = effect.id
    dispatch(updateEffect(attrs))
  }

  //  const handleRestoreDefaults = () => {
  //    dispatch(restoreDefaults(id))
  //  }

  const renderedModelSelection = (
    <Row className="align-items-center">
      <Col
        sm={5}
        className="mb-1"
      >
        Type
      </Col>

      <Col
        sm={7}
        className="mb-1"
      >
        <Select
          value={selectedOption}
          //          onChange={handleChangeType}
          maxMenuHeight={305}
          options={selectOptions}
        />
      </Col>
    </Row>
  )

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
      {renderedModelSelection}
      {renderedModelOptions}
    </div>
  )
}

export default EffectEditor
