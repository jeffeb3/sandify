import React from "react"
import { useSelector, useDispatch, shallowEqual } from "react-redux"
import { Shape, Transformer } from "react-konva"
import {
  //  makeGetPreviewTrackVertices,
  makeGetPreviewVertices,
  getSliderColors,
  getVertexOffsets,
  getAllComputedVertices,
  getSliderBounds,
} from "../machine/selectors"
import { updateLayer } from "../layers/layersSlice"
import { getLayers, getPreview } from "../store/selectors"
import Layer from "@/features/layers/Layer"
import { getModelFromType } from "@/config/models"
import {
  getCurrentLayer,
  makeGetLayerIndex,
  makeGetLayer,
  getNumVisibleLayers,
} from "../layers/selectors"
import { getCachedSelector } from "../store/selectors"
import { roundP } from "../../common/util"
import PreviewHelper from "./PreviewHelper"

// Renders the shapes in the preview window and allows the user to interact with the shape.
const PreviewLayer = (ownProps) => {
  const mapStateToProps = (state) => {
    // if a layer matching this shape's id does not exist, we have a zombie
    // child. It has to do with a child (preview shape) subscribing to the store
    // before its parent (preview window), and trying to render first after a
    // layer is removed. This is a tangled, but well-known problem with React-Redux
    // hooks, and the solution for now is to render the current layer instead.
    // https://react-redux.js.org/api/hooks#stale-props-and-zombie-children
    // It's quite likely there is a more elegant/proper way around this.
    const layers = getLayers(state)
    const layer =
      getCachedSelector(makeGetLayer, ownProps.id)(state) ||
      getCurrentLayer(state)
    const index = getCachedSelector(makeGetLayerIndex, layer.id)(state)
    const numLayers = getNumVisibleLayers(state)
    const preview = getPreview(state)

    return {
      layer,
      start: index === 0,
      end: index === numLayers - 1,
      currentLayer: getCurrentLayer(state),
      //      trackVertices: getCachedSelector(
      //        makeGetPreviewTrackVertices,
      //        layerState.id,
      //      )(state),
      vertices: getCachedSelector(makeGetPreviewVertices, layer.id)(state),
      allVertices: getAllComputedVertices(state),
      selected: layers.selected,
      sliderValue: preview.sliderValue,
      colors: getSliderColors(state),
      offsets: getVertexOffsets(state),
      offsetId: layer.id,
      bounds: getSliderBounds(state),
      markCoordinates: false, // debug feature: set to true to see coordinates while drawing
    }
  }

  const props = useSelector(mapStateToProps, shallowEqual)
  const {
    layer,
    selected,
    sliderValue,
    vertices,
    offsets,
    start,
    end,
    currentLayer,
    colors,
    bounds,
  } = props
  //const layer = new Layer(layerState.type)
  const model = getModelFromType(layer.type)
  const dispatch = useDispatch()
  const width = layer.width
  const height = layer.height
  const selectedColor = "yellow"
  const unselectedColor = "rgba(195, 214, 230, 0.65)"
  const backgroundSelectedColor = "#6E6E00"
  const backgroundUnselectedColor = "rgba(195, 214, 230, 0.4)"
  const isSelected = selected === ownProps.id
  const isSliding = sliderValue !== 0
  const helper = new PreviewHelper(props)

  // draws a colored path when user is using slider
  function drawLayerVertices(context, bounds) {
    const { end } = bounds
    let oldColor = null
    let currentColor = isSelected ? selectedColor : unselectedColor

    context.beginPath()
    context.lineWidth = 1
    context.strokeStyle = currentColor
    helper.moveTo(context, vertices[0])
    context.stroke()

    context.beginPath()
    for (let i = 1; i < vertices.length; i++) {
      if (isSliding) {
        let absoluteI = i + offsets[layer.id].start
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

  function drawStartAndEndPoints(context) {
    const start = vertices[0]
    const end = vertices[vertices.length - 1]

    context.beginPath()
    context.strokeStyle = "green"
    helper.dot(context, start, start ? 5 : 3)
    helper.markOriginalCoordinates(context, start)

    if (end) {
      context.beginPath()
      context.strokeStyle = "red"
      helper.dot(context, end, end ? 5 : 3)
      helper.markOriginalCoordinates(context, end)
    }
  }

  // TODO: fix or remove
  // draws the line representing the track the path follows
  //  function drawTrackVertices(context) {
  //    context.beginPath()
  //    context.lineWidth = 4.0
  //    context.strokeStyle = "green"
  //    helper.moveTo(context, props.trackVertices[0])
  //    for (let i = 0; i < props.trackVertices.length; i++) {
  //      helper.lineTo(context, props.trackVertices[i])
  //    }
  //    context.stroke()
  //  }

  // used by Konva to draw our custom shape
  function sceneFunc(context, shape) {
    if (vertices && vertices.length > 0) {
      // TODO: fix or remove
      //      if (props.trackVertices && props.trackVertices.length > 0) {
      //        drawTrackVertices(context)
      //      }

      drawLayerVertices(context, bounds)

      if (start || end || isSelected) {
        drawStartAndEndPoints(context)
      }
      helper.drawSliderEndPoint(context)
    }

    context.fillStrokeShape(shape)
  }

  // used by Konva to mark boundaries of shape
  function hitFunc(context) {
    context.fillStrokeShape(this)
  }

  function onChange(attrs) {
    attrs.id = layer.id
    dispatch(updateLayer(attrs))
  }

  function onSelect() {
    // deselection is currently disabled
    // dispatch(setSelectedLayer(selected == null ? currentLayer.id : null))
  }

  const shapeRef = React.createRef()
  const trRef = React.createRef()

  React.useEffect(() => {
    if (layer.visible && isSelected && model.canChangeSize(layer)) {
      // we need to attach transformer manually
      trRef.current.nodes([shapeRef.current])
      trRef.current.getLayer().batchDraw()
    }
  }, [isSelected, layer, model.canMove, shapeRef, trRef])

  return (
    <React.Fragment>
      {layer.visible && (
        <Shape
          {...props}
          draggable={model.canMove && layer.id === currentLayer.id}
          width={width}
          height={height}
          offsetY={height / 2}
          offsetX={width / 2}
          x={layer.x || 0}
          y={-layer.y || 0}
          onClick={onSelect}
          onTap={onSelect}
          ref={shapeRef}
          strokeWidth={1}
          rotation={layer.rotation || 0}
          sceneFunc={sceneFunc}
          hitFunc={hitFunc}
          onDragStart={(e) => {
            onChange({ dragging: true })
          }}
          onDragEnd={(e) => {
            onChange({
              dragging: false,
              x: roundP(e.target.x(), 0),
              y: roundP(-e.target.y(), 0),
            })
          }}
          onTransformStart={(e) => {
            onChange({ dragging: true })
          }}
          onTransformEnd={(e) => {
            const node = shapeRef.current
            const scaleX = node.scaleX()
            const scaleY = node.scaleY()

            // we will reset it back
            node.scaleX(1)
            node.scaleY(1)

            onChange({
              dragging: false,
              width: roundP(Math.max(5, layer.width * scaleX), 0),
              height: roundP(Math.max(5, layer.height * scaleY), 0),
              rotation: roundP(node.rotation(), 0),
            })
          }}
        />
      )}
      {layer.visible && isSelected && model.canChangeSize(layer) && (
        <Transformer
          ref={trRef}
          centeredScaling={true}
          resizeEnabled={model.canResize}
          rotateEnabled={model.canRotate(layer)}
          rotationSnaps={[0, 90, 180, 270]}
          enabledAnchors={
            !model.canChangeHeight(layer)
              ? ["top-left", "top-right", "bottom-left", "bottom-right"]
              : null
          }
        />
      )}
    </React.Fragment>
  )
}

export default PreviewLayer
