import React from "react"
import { useDispatch, useSelector } from "react-redux"
import { IconContext } from "react-icons"
import {
  AiOutlineRotateRight,
  AiTwotoneLock,
  AiTwotoneUnlock,
} from "react-icons/ai"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import Button from "react-bootstrap/Button"
import { Tooltip } from "react-tooltip"
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

  const handleChangeMaintainAspectRatio = (value) => {
    dispatch(
      updateEffect({
        id: effect.id,
        maintainAspectRatio: !effect.maintainAspectRatio,
      }),
    )
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
    <div className="ps-1 flex-grow-1 mt-3 container-fluid pe-0">
      {renderedModelOptions}
      {model.canTransform(effect) && (
        <Row className="align-items-center mt-1 mb-1">
          <Col sm={3}>Transform</Col>
          <Col sm={9}>
            <div className="d-flex">
              <div className="d-flex flex-column">
                <Row>
                  {model.canMove(effect) && (
                    <Col xs={6}>
                      {getOptionComponent(model, layerOptions, "x")}
                    </Col>
                  )}
                  {model.canChangeSize(effect) && (
                    <Col xs={6}>
                      {getOptionComponent(model, layerOptions, "width")}
                    </Col>
                  )}
                </Row>
                <Row className="mt-1">
                  {model.canMove(effect) && (
                    <Col xs={6}>
                      {getOptionComponent(model, layerOptions, "y")}
                    </Col>
                  )}
                  {model.canChangeSize(effect) && (
                    <Col xs={6}>
                      {getOptionComponent(model, layerOptions, "height")}
                    </Col>
                  )}
                </Row>
              </div>
              {model.canChangeAspectRatio(effect) && (
                <div className="ms-1 align-self-center">
                  <Tooltip id="tooltip-maintain-aspect-ratio" />
                  <Button
                    className="layer-button"
                    variant="light"
                    data-tooltip-content="Maintain aspect ratio"
                    data-tooltip-id="tooltip-maintain-aspect-ratio"
                    onClick={handleChangeMaintainAspectRatio}
                  >
                    {effect.maintainAspectRatio && (
                      <IconContext.Provider value={{ size: "1.3rem" }}>
                        <AiTwotoneLock />
                      </IconContext.Provider>
                    )}
                    {!effect.maintainAspectRatio && (
                      <IconContext.Provider value={{ size: "1.3rem" }}>
                        <AiTwotoneUnlock />
                      </IconContext.Provider>
                    )}
                  </Button>
                </div>
              )}
            </div>
            {model.canRotate(effect) && (
              <div className="d-flex">
                <Row className="flex-grow-1">
                  <Col xs={6}>
                    <div className="d-flex align-items-center mt-1">
                      <div className="me-1">
                        <IconContext.Provider value={{ size: "1.3rem" }}>
                          <AiOutlineRotateRight />
                        </IconContext.Provider>
                      </div>
                      {getOptionComponent(
                        model,
                        layerOptions,
                        "rotation",
                        false,
                      )}
                    </div>
                  </Col>
                </Row>
                {/* hack to get spacing to work */}
                {model.canChangeAspectRatio(effect) && (
                  <div className="ms-1 align-self-center">
                    <Button
                      className="layer-button invisible"
                      variant="light"
                    >
                      <IconContext.Provider value={{ size: "1.3rem" }}>
                        <AiTwotoneLock />
                      </IconContext.Provider>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Col>
        </Row>
      )}
    </div>
  )
}

export default EffectEditor
