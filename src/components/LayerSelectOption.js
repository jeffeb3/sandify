/* global document */

import React from "react"
import { useSelector, useStore, shallowEqual } from "react-redux"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import Form from "react-bootstrap/Form"
import Select from "react-select"
import {
  selectLayerIds,
  selectLayerById,
  selectLayerVertices,
} from "@/features/layers/layersSlice"
import { dimensions } from "@/common/geometry"
import { getShape } from "@/features/shapes/shapeFactory"

const LayerSelectOption = ({ options, optionKey, data, onChange, index }) => {
  const store = useStore()
  const option = options[optionKey]
  const currentChoice = data[optionKey]
  const effectLayerId = data.layerId

  // Get all layer IDs (including invisible - they can still be mask sources)
  const allLayerIds = useSelector(selectLayerIds)

  // Find index of the layer this effect belongs to
  const effectLayerIndex = allLayerIds.indexOf(effectLayerId)

  // Get only preceding layers (those before effectLayerIndex)
  const precedingLayerIds =
    effectLayerIndex > 0 ? allLayerIds.slice(0, effectLayerIndex) : []

  // Build choices from preceding layers, excluding Erasers (they fill space, not define boundaries)
  const layers = useSelector(
    (state) =>
      precedingLayerIds
        .map((id) => selectLayerById(state, id))
        .filter((layer) => getShape(layer.type).selectGroup !== "Erasers"),
    shallowEqual,
  )

  const choices = [
    { value: "", label: "(none)" },
    ...layers.map((layer) => ({
      value: layer.id,
      label:
        (layer.name || `Layer ${layer.id.slice(0, 6)}`) +
        (layer.visible ? "" : " (hidden)"),
    })),
  ]

  const currentLabel =
    choices.find((choice) => choice.value === currentChoice)?.label || "(none)"

  const visible =
    option.isVisible === undefined ? true : option.isVisible(null, data)

  const handleChange = (choice) => {
    const value = choice.value || null
    let attrs = {}
    attrs[optionKey] = value

    // Set initial width/height only on first selection (not when changing sources)
    if (value && !currentChoice) {
      const state = store.getState()
      const vertices = selectLayerVertices(state, value)
      if (vertices && vertices.length > 0) {
        const dims = dimensions(vertices)
        attrs.width = dims.width
        attrs.height = dims.height
      }
    }

    if (option.onChange !== undefined) {
      attrs = option.onChange(null, attrs, data)
    }

    onChange(attrs)
  }

  return (
    <Row
      className={"align-items-center mb-1" + (visible ? "" : " d-none")}
      key={index}
    >
      <Col sm={5}>
        <Form.Label
          className="m-0"
          htmlFor="options-layer-select"
        >
          {option.title}
        </Form.Label>
      </Col>

      <Col sm={7}>
        <Select
          value={{ value: currentChoice || "", label: currentLabel }}
          onChange={handleChange}
          options={choices}
          menuPortalTarget={document.body}
          menuPlacement="auto"
          styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
        />
      </Col>
    </Row>
  )
}

export default LayerSelectOption
