import React from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button, Row, Col } from "react-bootstrap"
import Select from "react-select"
import { IconContext } from "react-icons"
import { AiOutlineRotateRight } from "react-icons/ai"
import CommentsBox from "@/components/CommentsBox"
import InputOption from "@/components/InputOption"
import DropdownOption from "@/components/DropdownOption"
import CheckboxOption from "@/components/CheckboxOption"
import ToggleButtonOption from "@/components/ToggleButtonOption"
import { getShapeSelectOptions } from "@/features/shapes/factory"
import { updateLayer, changeModelType, restoreDefaults } from "./layersSlice"
import Layer from "./Layer"
import EffectManager from "@/features/effects/EffectManager"
import { selectSelectedLayer } from "./layersSlice"

const LayerEditor = () => {
  const dispatch = useDispatch()
  const layer = useSelector(selectSelectedLayer)
  const instance = new Layer(layer.type)
  const model = instance.model
  const layerOptions = instance.getOptions()
  const modelOptions = model.getOptions()
  const selectOptions = getShapeSelectOptions()
  const allowModelSelection = model.selectGroup !== "import"
  const selectedOption = {
    value: model.type,
    label: model.label,
  }
  const link = model.link
  const linkText = model.linkText || "here"
  const renderedLink = link ? (
    <div className="mt-4">
      See{" "}
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={link}
      >
        {linkText}
      </a>{" "}
      for ideas.
    </div>
  ) : undefined

  const handleChangeType = (selected) => {
    dispatch(changeModelType({ id: layer.id, type: selected.value }))
  }

  const handleChange = (attrs) => {
    attrs.id = layer.id
    dispatch(updateLayer(attrs))
  }

  const handleRestoreDefaults = () => {
    dispatch(restoreDefaults(layer.id))
  }

  const renderedModelSelection = allowModelSelection && (
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
          onChange={handleChangeType}
          maxMenuHeight={305}
          options={selectOptions}
          menuPortalTarget={document.body}
          styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
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
      data: layer,
      object: model,
      label,
    }

    switch (option.type) {
      case "dropdown":
        return <DropdownOption {...props} />
      case "checkbox":
        return <CheckboxOption {...props} />
      case "comments":
        return <CommentsBox {...props} />
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
    <div className="overflow-visible flex-grow-1">
      <div className="px-3 pt-3 border-top border-secondary">
        {getOptionComponent(model, layerOptions, "name")}

        {renderedModelSelection}
        {renderedModelOptions}
        {renderedLink}
        <EffectManager />
      </div>
      <div className="border-top border-secondary px-3 py-3 mt-3">
        {model.canTransform(layer) && (
          <Row className="align-items-center mt-1 mb-2">
            <Col sm={5}>Transform</Col>
            <Col sm={7}>
              {model.canMove(layer) && (
                <Row>
                  <Col xs={6}>
                    {getOptionComponent(model, layerOptions, "x")}
                  </Col>
                  <Col xs={6}>
                    {getOptionComponent(model, layerOptions, "y")}
                  </Col>
                </Row>
              )}
              {model.canChangeSize(layer) && (
                <Row className="mt-1">
                  <Col xs={6}>
                    {getOptionComponent(model, layerOptions, "width")}
                  </Col>
                  <Col xs={6}>
                    {getOptionComponent(model, layerOptions, "height")}
                  </Col>
                </Row>
              )}
              {model.canRotate(layer) && (
                <Row className="mt-1">
                  <Col xs={6}>
                    <div className="d-flex align-items-center">
                      <div className="mr-1">
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
              )}
            </Col>
          </Row>
        )}
        {getOptionComponent(model, layerOptions, "connectionMethod")}

        <Button
          className="mt-3"
          variant="secondary"
          onClick={handleRestoreDefaults}
        >
          Restore defaults
        </Button>
      </div>
    </div>
  )
}

export default LayerEditor