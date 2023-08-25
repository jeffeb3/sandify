import React from "react"
import { useSelector } from "react-redux"
import { isEqual } from "lodash"
import { Shape } from "react-konva"
import {
  selectSelectedLayer,
  selectLayerById,
  selectCurrentLayerId,
  selectSliderBounds,
  selectSliderColors,
  selectVertexOffsets,
  selectConnectingVertices,
  selectActiveEffect,
} from "@/features/layers/layersSlice"
import { selectCurrentEffectId } from "@/features/effects/effectsSlice"
import { selectPreviewState } from "@/features/preview/previewSlice"
import PreviewHelper from "./PreviewHelper"

const ConnectorPreview = (ownProps) => {
  const { startId, endId } = ownProps
  const selectedLayer = useSelector(selectSelectedLayer)
  const currentLayerId = useSelector(selectCurrentLayerId)
  const currentEffectId = useSelector(selectCurrentEffectId)
  const startLayer = useSelector((state) => selectLayerById(state, startId))
  const endLayer = useSelector((state) => selectLayerById(state, endId))
  const startActiveEffect = useSelector((state) =>
    selectActiveEffect(state, startId),
  )
  const endActiveEffect = useSelector((state) =>
    selectActiveEffect(state, endId),
  )
  const vertices = useSelector((state) =>
    selectConnectingVertices(state, startId),
  )
  const sliderValue = useSelector(selectPreviewState).sliderValue
  const colors = useSelector(selectSliderColors)
  const offsets = useSelector(selectVertexOffsets)
  const bounds = useSelector(selectSliderBounds, isEqual)

  if (!(startLayer && endLayer && selectedLayer)) {
    return null
  } // no longer valid

  const isDragging =
    startLayer.dragging ||
    endLayer.dragging ||
    startActiveEffect?.dragging ||
    endActiveEffect?.dragging
  const helper = new PreviewHelper({
    selectedLayer,
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

  const currentColor = "rgba(41, 131, 186, 0.7)"
  const unselectedColor = "rgba(255, 255, 0, 0.7)"
  const backgroundSelectedColor = "#2983BA"
  const backgroundUnselectedColor = "rgba(195, 214, 230, 0.4)"
  const isSliding = sliderValue !== 0
  const isCurrent =
    currentLayerId === startLayer.id || currentLayerId == endLayer.id

  function sceneFunc(context, shape) {
    if (!isDragging) {
      drawConnector(context)
    }

    if (currentLayerId == startLayer.id) {
      drawPoint(vertices[vertices.length - 1], context)
    }

    if (currentLayerId == endLayer.id) {
      drawPoint(vertices[0], context)
    }

    helper.drawSliderEndPoint(context)
    context.fillStrokeShape(shape)
  }

  function drawConnector(context) {
    const { end } = bounds
    let oldColor = null
    let color = isCurrent
      ? currentColor
      : currentLayerId || currentEffectId
      ? backgroundUnselectedColor
      : unselectedColor

    context.beginPath()
    context.lineWidth = 1
    context.strokeStyle = color
    helper.moveTo(context, vertices[0])
    context.stroke()

    context.beginPath()
    for (let i = 1; i < vertices.length; i++) {
      if (isSliding) {
        let absoluteI = offsets[endLayer.id].start - vertices.length + i
        let pathColor =
          absoluteI <= end ? backgroundSelectedColor : backgroundUnselectedColor

        color = colors[absoluteI] || pathColor
        if (color !== oldColor) {
          context.stroke()
          context.strokeStyle = color
          oldColor = color
          context.beginPath()
        }
      }

      helper.moveTo(context, vertices[i - 1])
      helper.lineTo(context, vertices[i])
    }
    context.stroke()
  }

  const drawPoint = (point, context) => {
    context.beginPath()
    context.strokeStyle = "transparent"
    helper.dot(context, point, point ? 5 : 3, backgroundSelectedColor)
    helper.markOriginalCoordinates(context, point)
  }

  return (
    <React.Fragment>
      {endLayer && (
        <Shape
          offsetX={startLayer.width / 2}
          offsetY={startLayer.height / 2}
          sceneFunc={sceneFunc}
        ></Shape>
      )}
    </React.Fragment>
  )
}

export default React.memo(ConnectorPreview)
