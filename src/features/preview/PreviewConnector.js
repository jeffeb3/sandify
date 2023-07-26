import React from "react"
import { useSelector } from "react-redux"
import { Shape } from "react-konva"
import {
  getSliderBounds,
  getSliderColors,
  getVertexOffsets,
  getConnectingVertices,
} from "@/features/machine/selectors"
import { getPreviewState } from "@/features/store/selectors"
import { getCurrentLayer, getLayer } from "@/features/layers/selectors"
import PreviewHelper from "./PreviewHelper"

// Renders a connector between two layers.
const PreviewConnector = (ownProps) => {
  const mapStateToProps = (state) => {
    // if a layer matching this shape's id does not exist, we have a zombie
    // child. It has to do with a child (preview shape) subscribing to the store
    // before its parent (preview window), and trying to render first after a
    // layer is removed. This is a tangled, but well-known problem with React-Redux
    // hooks, and the solution for now is to render the current layer instead.
    // https://react-redux.js.org/api/hooks#stale-props-and-zombie-children
    // It's quite likely there is a more elegant/proper way around this.
    const { startId, endId } = ownProps
    const currentLayer = getCurrentLayer(state)
    const startLayer = getLayer(state, startId) || getCurrentLayer(state)
    const endLayer = getLayer(state, endId)
    const vertices = getConnectingVertices(state, startId)
    const preview = getPreviewState(state)

    return {
      currentLayer,
      startLayer,
      endLayer,
      vertices,
      layer: startLayer, // renamed for preview helper
      sliderValue: preview.sliderValue,
      colors: getSliderColors(state),
      offsetId: startId + "-connector",
      offsets: getVertexOffsets(state),
      bounds: getSliderBounds(state),
    }
  }

  const props = useSelector(mapStateToProps)
  const {
    currentLayer,
    startLayer,
    endLayer,
    vertices,
    offsets,
    colors,
    bounds,
    sliderValue,
  } = props
  const helper = new PreviewHelper(props)
  const selectedColor = "yellow"
  const unselectedColor = "rgba(195, 214, 230, 0.65)"
  const backgroundSelectedColor = "#6E6E00"
  const backgroundUnselectedColor = "rgba(195, 214, 230, 0.4)"
  const isSliding = sliderValue !== 0
  const isSelected = currentLayer.id === endLayer.id

  // used by Konva to draw shape
  function sceneFunc(context, shape) {
    drawConnector(context)
    helper.drawSliderEndPoint(context)
    context.fillStrokeShape(shape)
  }

  // used by Konva to mark boundaries of shape
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
