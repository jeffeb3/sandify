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
import ModelOption from "@/components/ModelOption"
import { getShapeSelectOptions } from "@/features/shapes/shapeFactory"
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

  // this should really be a component, but I could not figure out how to get it
  // to not re-render as the value changed; the fallout is that the editor re-renders
  // more than it should, but it's not noticeable
  const renderOption = ({
    optionKey,
    options = layerOptions,
    label = true,
  }) => {
    return (
      <ModelOption
        model={model}
        key={optionKey}
        data={layer}
        options={options}
        optionKey={optionKey}
        onChange={handleChange}
        label={label}
      />
    )
  }

  const renderedModelOptions = Object.keys(modelOptions).map((optionKey) =>
    renderOption({ options: modelOptions, optionKey }),
  )

  return (
    <div className="overflow-visible flex-grow-1">
      <div className="px-3 pt-3 border-top border-secondary">
        {renderOption({ optionKey: "name" })}
        {renderedModelSelection}
        {renderedModelOptions}
        {renderOption({ optionKey: "connectionMethod" })}
        {renderedLink}
      </div>
      <div className="px-3 py-2">
        {model.canTransform(layer) && (
          <Row className="align-items-center mt-1 mb-1">
            <Col sm={3}>Transform</Col>
            <Col sm={9}>
              <div className="d-flex">
                <div className="d-flex flex-column">
                  <Row>
                    {model.canMove(layer) && (
                      <Col xs={6}>{renderOption({ optionKey: "x" })}</Col>
                    )}
                    {model.canChangeSize(layer) && (
                      <Col xs={6}>{renderOption({ optionKey: "width" })}</Col>
                    )}
                  </Row>
                  <Row className="mt-1">
                    {model.canMove(layer) && (
                      <Col xs={6}>{renderOption({ optionKey: "y" })}</Col>
                    )}
                    {model.canChangeSize(layer) && (
                      <Col xs={6}>{renderOption({ optionKey: "height" })}</Col>
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
                        {renderOption({
                          optionKey: "rotation",
                          label: false,
                        })}
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

export default React.memo(LayerEditor)
