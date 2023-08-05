import React, { useEffect, useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import Slider from "rc-slider"
import "rc-slider/assets/index.css"
import Downloader from "@/features/exporter/Downloader"
import { selectFontsState } from "@/features/fonts/fontsSlice"
import { selectCurrentLayer } from "@/features/layers/layersSlice"
import { selectPreviewState } from "@/features/preview/previewSlice"
import { updateLayer, selectVerticesStats } from "@/features/layers/layersSlice"
import { getShapeFromType } from "@/features/shapes/factory"
import "./Preview.scss"
import { updatePreview } from "./previewSlice"
import PreviewWindow from "./PreviewWindow"

const Preview = () => {
  const dispatch = useDispatch()
  const fonts = useSelector(selectFontsState)
  const currentLayer = useSelector(selectCurrentLayer)
  const sliderValue = useSelector(selectPreviewState).sliderValue
  const verticesStats = useSelector(selectVerticesStats)
  const previewElement = useRef(null)
  const model = getShapeFromType(currentLayer.type)

  useEffect(() => {
    if (fonts.loaded) {
      previewElement.current.focus()
    }
  }, [fonts.loaded])

  const handleSliderChange = (value) => {
    dispatch(updatePreview({ sliderValue: value }))
  }

  const handleKeyDown = (event) => {
    if (model.canMove) {
      let attrs = { id: currentLayer.id }
      const delta = event.shiftKey ? 1 : 5

      switch (event.key) {
        case "ArrowDown":
          attrs.y = currentLayer.y - delta
          break
        case "ArrowUp":
          attrs.y = currentLayer.y + delta
          break
        case "ArrowLeft":
          attrs.x = currentLayer.x - delta
          break
        case "ArrowRight":
          attrs.x = currentLayer.x + delta
          break
        default:
          return
      }

      dispatch(updateLayer(attrs))
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
      <div className="flex-grow-1 d-flex flex-column">
        <div
          id="preview-wrapper"
          className="preview-wrapper d-flex flex-column align-items-center"
          ref={previewElement}
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <PreviewWindow />
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
          <Downloader />
        </div>
      </div>
    </div>
  )
}

export default Preview
