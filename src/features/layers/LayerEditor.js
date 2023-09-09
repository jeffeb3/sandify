import React from "react"
import { useDispatch, useSelector } from "react-redux"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import Button from "react-bootstrap/Button"
import Select from "react-select"
import { Tooltip } from "react-tooltip"
import { IconContext } from "react-icons"
import {
  AiOutlineRotateRight,
  AiTwotoneLock,
  AiTwotoneUnlock,
} from "react-icons/ai"
import CommentsBox from "@/components/CommentsBox"
import InputOption from "@/components/InputOption"
import DropdownOption from "@/components/DropdownOption"
import CheckboxOption from "@/components/CheckboxOption"
import ToggleButtonOption from "@/components/ToggleButtonOption"
import { getShapeSelectOptions } from "@/features/shapes/factory"
import { updateLayer, changeModelType } from "./layersSlice"
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
    <div className="mt-3">
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

  const handleChangeMaintainAspectRatio = (value) => {
    dispatch(
      updateLayer({
        id: layer.id,
        maintainAspectRatio: !layer.maintainAspectRatio,
      }),
    )
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
        {getOptionComponent(model, layerOptions, "connectionMethod")}
        {renderedLink}
      </div>
      <div className="border-top px-3 py-3 mt-2">
        {model.canTransform(layer) && (
          <Row className="align-items-center mt-1 mb-1">
            <Col sm={3}>Transform</Col>
            <Col sm={9}>
              <div className="d-flex">
                <div className="d-flex flex-column">
                  <Row>
                    {model.canMove(layer) && (
                      <Col xs={6}>
                        {getOptionComponent(model, layerOptions, "x")}
                      </Col>
                    )}
                    {model.canChangeSize(layer) && (
                      <Col xs={6}>
                        {getOptionComponent(model, layerOptions, "width")}
                      </Col>
                    )}
                  </Row>
                  <Row className="mt-1">
                    {model.canMove(layer) && (
                      <Col xs={6}>
                        {getOptionComponent(model, layerOptions, "y")}
                      </Col>
                    )}
                    {model.canChangeSize(layer) && (
                      <Col xs={6}>
                        {getOptionComponent(model, layerOptions, "height")}
                      </Col>
                    )}
                  </Row>
                </div>
                {model.canChangeAspectRatio(layer) && (
                  <div className="ms-1 align-self-center">
                    <Tooltip id="tooltip-maintain-aspect-ratio" />
                    <Button
                      className="layer-button"
                      variant="light"
                      data-tooltip-content="Maintain aspect ratio"
                      data-tooltip-id="tooltip-maintain-aspect-ratio"
                      onClick={handleChangeMaintainAspectRatio}
                    >
                      {layer.maintainAspectRatio && (
                        <IconContext.Provider value={{ size: "1.3rem" }}>
                          <AiTwotoneLock />
                        </IconContext.Provider>
                      )}
                      {!layer.maintainAspectRatio && (
                        <IconContext.Provider value={{ size: "1.3rem" }}>
                          <AiTwotoneUnlock />
                        </IconContext.Provider>
                      )}
                    </Button>
                  </div>
                )}
              </div>
              {model.canRotate(layer) && (
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
                  {model.canChangeAspectRatio(layer) && (
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
      <div className="border-top border-secondary px-3 pt-1">
        <EffectManager />
      </div>
    </div>
  )
}

export default LayerEditor
