import React from "react"
import { useDispatch, useSelector } from "react-redux"
import { IconContext } from "react-icons"
import { AiOutlineRotateRight } from "react-icons/ai"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
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
  const type = effect?.type || "mask" // guard zombie child
  const instance = new EffectLayer(type)
  const model = new EffectLayer(type).model
  const layerOptions = instance.getOptions()
  const modelOptions = model.getOptions()

  const handleChange = (attrs) => {
    attrs.id = effect.id
    dispatch(updateEffect(attrs))
  }

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
    <div className="ps-1 overflow-hidden flex-grow-1 mt-3 container-fluid pe-0">
      {renderedModelOptions}
      {model.canTransform(effect) && (
        <Row className="align-items-center mt-1 mb-1">
          <Col sm={5}>Transform</Col>
          <Col sm={7}>
            {model.canMove(effect) && (
              <Row>
                <Col xs={6}>{getOptionComponent(model, layerOptions, "x")}</Col>
                <Col xs={6}>{getOptionComponent(model, layerOptions, "y")}</Col>
              </Row>
            )}
            {model.canChangeSize(effect) && (
              <Row className="mt-1">
                <Col xs={6}>
                  {getOptionComponent(model, layerOptions, "width")}
                </Col>
                <Col xs={6}>
                  {getOptionComponent(model, layerOptions, "height")}
                </Col>
              </Row>
            )}
            {model.canRotate(effect) && (
              <Row className="mt-1">
                <Col xs={6}>
                  <div className="d-flex align-items-center">
                    <div className="me-1">
                      <IconContext.Provider value={{ size: "1.3rem" }}>
                        <AiOutlineRotateRight />
                      </IconContext.Provider>
                    </div>
                    {getOptionComponent(model, layerOptions, "rotation", false)}
                  </div>
                </Col>
              </Row>
            )}
          </Col>
        </Row>
      )}
    </div>
  )
}

export default EffectEditor
