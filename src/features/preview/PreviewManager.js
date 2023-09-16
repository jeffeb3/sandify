import React, { useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import Select from "react-select"
import Slider from "rc-slider"
import "rc-slider/assets/index.css"
import {
  updateEffect,
  selectCurrentEffect,
} from "@/features/effects/effectsSlice"
import {
  selectPreviewSliderValue,
  selectPreviewZoom,
} from "@/features/preview/previewSlice"
import { updateLayer, selectCurrentLayer } from "@/features/layers/layersSlice"
import { getShape } from "@/features/shapes/shapeFactory"
import { getEffect } from "@/features/effects/effectFactory"
import "./PreviewManager.scss"
import { updatePreview } from "./previewSlice"
import PreviewWindow from "./PreviewWindow"

const PreviewManager = () => {
  const dispatch = useDispatch()
  const currentLayer = useSelector(selectCurrentLayer)
  const currentEffectLayer = useSelector(selectCurrentEffect)
  const sliderValue = useSelector(selectPreviewSliderValue)
  const zoom = useSelector(selectPreviewZoom)
  const wrapperRef = useRef()

  const currentShape = getShape(currentLayer?.type || "polygon")
  const currentEffect = getEffect(currentEffectLayer?.type || "mask")
  const zoomChoices = [
    { value: 0.25, label: "25%" },
    { value: 0.5, label: "50%" },
    { value: 1.0, label: "100%" },
    { value: 2.0, label: "200%" },
    { value: 4.0, label: "400%" },
  ]
  const selectedZoomOption = zoomChoices.find((choice) => choice.value == zoom)
  const previewAlignClass = zoom <= 1 ? " justify-content-center" : ""

  const handleSliderChange = (value) => {
    dispatch(updatePreview({ sliderValue: value }))
  }

  const handleZoomChange = (option) => {
    dispatch(updatePreview({ zoom: option.value }))
  }

  const arrowKeyChange = (layer, event) => {
    if (!layer) {
      return
    }

    const attrs = { id: layer.id }
    const delta = event.shiftKey ? 1 : 5

    switch (event.key) {
      case "ArrowDown":
        attrs.y = layer.y - delta
        break
      case "ArrowUp":
        attrs.y = layer.y + delta
        break
      case "ArrowLeft":
        attrs.x = layer.x - delta
        break
      case "ArrowRight":
        attrs.x = layer.x + delta
        break
      default:
        break
    }

    return attrs
  }

  const handleKeyDown = (event) => {
    if (currentLayer) {
      if (currentShape.canMove(currentLayer)) {
        const attrs = arrowKeyChange(currentLayer, event)
        dispatch(updateLayer(attrs))
      }
    } else if (currentEffectLayer) {
      if (currentEffect.canMove(currentEffectLayer)) {
        const attrs = arrowKeyChange(currentEffectLayer, event)
        dispatch(updateEffect(attrs))
      }
    }
  }

  return (
    <div
      className="machine-preview d-flex flex-grow-1 flex-column"
      id="machine-preview"
    >
      <div
        id="preview-main"
        className="flex-grow-1 d-flex flex-column"
      >
        <div
          className="d-flex flex-column"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <div
            id="preview-wrapper"
            className={`preview-wrapper d-flex flex-column${previewAlignClass}`}
            ref={wrapperRef}
          >
            <PreviewWindow />
          </div>
        </div>

        <div className="mt-auto py-2 bg-white d-flex align-items-center">
          <div className="mx-2">
            <Select
              id="zoom-select"
              options={zoomChoices}
              styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              value={selectedZoomOption}
              onChange={handleZoomChange}
            ></Select>
          </div>
          <div className="flex-grow-1 ms-3 me-2">
            <Slider
              value={sliderValue}
              step={1}
              min={0.0}
              max={100.0}
              onChange={handleSliderChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(PreviewManager)
