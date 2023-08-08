import React from "react"
import { useSelector } from "react-redux"
import { Shape } from "react-konva"
import {
  selectCurrentLayer,
  selectLayerById,
  selectSliderBounds,
  selectSliderColors,
  selectVertexOffsets,
  selectConnectingVertices,
} from "@/features/layers/layersSlice"
import { selectPreviewState } from "@/features/preview/previewSlice"
import PreviewHelper from "./PreviewHelper"

const PreviewConnector = (ownProps) => {
  const { startId, endId } = ownProps
  const currentLayer = useSelector(selectCurrentLayer)
  const startLayer = useSelector((state) => selectLayerById(state, startId))
  const endLayer = useSelector((state) => selectLayerById(state, endId))
  const vertices = useSelector((state) =>
    selectConnectingVertices(state, startId),
  )
  const sliderValue = useSelector(selectPreviewState).sliderValue
  const colors = useSelector(selectSliderColors)
  const offsets = useSelector(selectVertexOffsets)
  const bounds = useSelector(selectSliderBounds)

  const helper = new PreviewHelper({
    currentLayer,
    startLayer,
    endLayer,
    vertices,
    layer: startLayer,
    sliderValue,
    colors,
    offsetId: startId + "-connector",
    offsets,
    bounds,
  })

  const selectedColor = "yellow"
  const unselectedColor = "rgba(195, 214, 230, 0.65)"
  const backgroundSelectedColor = "#6E6E00"
  const backgroundUnselectedColor = "rgba(195, 214, 230, 0.4)"
  const isSliding = sliderValue !== 0
  const isSelected = currentLayer.id === endLayer.id

  function sceneFunc(context, shape) {
    drawConnector(context)
    helper.drawSliderEndPoint(context)
    context.fillStrokeShape(shape)
  }

  function hitFunc(context) {
    context.fillStrokeShape(this)
  }

  function drawConnector(context) {
    const { end } = bounds
    let oldColor = null
    let currentColor = isSelected ? selectedColor : unselectedColor

    context.beginPath()
    context.lineWidth = 1
    context.strokeStyle = unselectedColor
    helper.moveTo(context, vertices[0])
    context.stroke()

    context.beginPath()
    for (let i = 1; i < vertices.length; i++) {
      if (isSliding) {
        let absoluteI = offsets[endLayer.id].start - vertices.length + i
        let pathColor =
          absoluteI <= end ? backgroundSelectedColor : backgroundUnselectedColor

        currentColor = colors[absoluteI] || pathColor
        if (currentColor !== oldColor) {
          context.stroke()
          context.strokeStyle = currentColor
          oldColor = currentColor
          context.beginPath()
        }
      }

      helper.moveTo(context, vertices[i - 1])
      helper.lineTo(context, vertices[i])
    }
    context.stroke()
  }

  return (
    <React.Fragment>
      {endLayer && !startLayer.dragging && !endLayer.dragging && (
        <Shape
          offsetX={startLayer.width / 2}
          offsetY={startLayer.height / 2}
          sceneFunc={sceneFunc}
          hitFunc={hitFunc}
        ></Shape>
      )}
    </React.Fragment>
  )
}

export default PreviewConnector
