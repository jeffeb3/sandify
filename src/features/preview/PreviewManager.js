import React from "react"
import { useSelector, useDispatch } from "react-redux"
import Slider from "rc-slider"
import "rc-slider/assets/index.css"
import { selectFontsState } from "@/features/fonts/fontsSlice"
import {
  updateEffect,
  selectCurrentEffect,
} from "@/features/effects/effectsSlice"
import { selectPreviewState } from "@/features/preview/previewSlice"
import {
  updateLayer,
  selectCurrentLayer,
  selectVerticesStats,
} from "@/features/layers/layersSlice"
import { getShapeFromType } from "@/features/shapes/factory"
import { getEffectFromType } from "@/features/effects/factory"
import "./PreviewManager.scss"
import { updatePreview } from "./previewSlice"
import PreviewWindow from "./PreviewWindow"

const PreviewManager = () => {
  const dispatch = useDispatch()
  const fonts = useSelector(selectFontsState)
  const currentLayer = useSelector(selectCurrentLayer)
  const currentEffectLayer = useSelector(selectCurrentEffect)
  const sliderValue = useSelector(selectPreviewState).sliderValue
  const verticesStats = useSelector(selectVerticesStats)
  const currentShape = getShapeFromType(currentLayer?.type || "polygon")
  const currentEffect = getEffectFromType(currentEffectLayer?.type || "mask")

  const handleSliderChange = (value) => {
    dispatch(updatePreview({ sliderValue: value }))
  }

  const arrowKeyChange = (layer, event) => {
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
    } else if (currentEffect) {
      if (currentEffect.canMove(currentEffectLayer)) {
        const attrs = arrowKeyChange(currentEffectLayer, event)
        dispatch(updateEffect(attrs))
      }
    }
  }

  if (!fonts.loaded) {
    return <div></div>
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
            className="preview-wrapper d-flex flex-column justify-content-center"
          >
            <PreviewWindow />
          </div>
        </div>

        <div className="mt-auto pt-2 bg-white d-flex align-items-center">
          <div className="flex-grow-1">
            <div className="mx-2">
              Points: {verticesStats.numPoints}, Distance:{" "}
              {verticesStats.distance}
            </div>

            <div className="p-3">
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
    </div>
  )
}

export default React.memo(PreviewManager)
