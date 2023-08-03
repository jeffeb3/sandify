import React, { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Shape, Transformer } from "react-konva"
import {
  selectPreviewVerticesById,
  selectSliderColors,
  selectVertexOffsets,
  selectSliderBounds,
} from "@/features/machine/machineSlice"
import { updateLayer } from "@/features/layers/layersSlice"
import { selectPreviewState } from "@/features/preview/previewSlice"
import { selectLayers } from "@/features/layers/layersSlice"
import { getModelFromType } from "@/config/models"
import {
  selectCurrentLayer,
  selectLayerIndexById,
  selectLayerById,
  selectNumVisibleLayers,
} from "@/features/layers/layersSlice"
import { roundP } from "@/common/util"
import PreviewHelper from "./PreviewHelper"

const PreviewLayer = (ownProps) => {
  const dispatch = useDispatch()
  const layers = useSelector(selectLayers)
  const currentLayer = useSelector(selectCurrentLayer)
  const layer =
    useSelector((state) => selectLayerById(state, ownProps.id)) || currentLayer
  const index = useSelector((state) => selectLayerIndexById(state, layer.id))
  const numLayers = useSelector(selectNumVisibleLayers)
  const preview = useSelector(selectPreviewState)
  const vertices = useSelector((state) =>
    selectPreviewVerticesById(state, layer.id, "1"),
  )
  const colors = useSelector(selectSliderColors)
  const offsets = useSelector(selectVertexOffsets)
  const bounds = useSelector(selectSliderBounds)

  const selected = layers.selected
  const sliderValue = preview.sliderValue
  const model = getModelFromType(layer.type)
  const start = index === 0
  const end = index === numLayers - 1
  const width = layer.width
  const height = layer.height
  const selectedColor = "yellow"
  const unselectedColor = "rgba(195, 214, 230, 0.65)"
  const backgroundSelectedColor = "#6E6E00"
  const backgroundUnselectedColor = "rgba(195, 214, 230, 0.4)"
  const isSelected = selected === ownProps.id
  const isSliding = sliderValue !== 0
  const isCurrent = layer.id === currentLayer.id
  const helper = new PreviewHelper({ layer, vertices, offsets, bounds, colors })

  const drawLayerVertices = (context, bounds) => {
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

  const drawStartAndEndPoints = (context) => {
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
  //  const drawTrackVertices = (context) => {
  //    context.beginPath()
  //    context.lineWidth = 4.0
  //    context.strokeStyle = "green"
  //    helper.moveTo(context, props.trackVertices[0])
  //    for (let i = 0; i < props.trackVertices.length; i++) {
  //      helper.lineTo(context, props.trackVertices[i])
  //    }
  //    context.stroke()
  //  }

  const sceneFunc = (context, shape) => {
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

  function hitFunc(context) {
    context.fillStrokeShape(this)
  }

  const handleChange = (attrs) => {
    attrs.id = layer.id
    dispatch(updateLayer(attrs))
  }

  const handleSelect = () => {
    // deselection is currently disabled
    // dispatch(setSelectedLayer(selected == null ? currentLayer.id : null))
  }

  const handleDragStart = () => {
    if (isCurrent) {
      handleChange({ dragging: true })
    }
  }

  const handleDragEnd = (e) => {
    handleChange({
      dragging: false,
      x: roundP(e.target.x(), 0),
      y: roundP(-e.target.y(), 0),
    })
  }

  const handleTransformStart = (e) => {
    handleChange({ dragging: true })
  }

  const handleTransformEnd = (e) => {
    const node = shapeRef.current
    const scaleX = node.scaleX()
    const scaleY = node.scaleY()

    node.scaleX(1)
    node.scaleY(1)

    handleChange({
      dragging: false,
      width: roundP(Math.max(5, layer.width * scaleX), 0),
      height: roundP(Math.max(5, layer.height * scaleY), 0),
      rotation: roundP(node.rotation(), 0),
    })
  }

  const shapeRef = React.useRef()
  const trRef = React.useRef()

  useEffect(() => {
    if (layer.visible && isSelected && model.canChangeSize(layer)) {
      trRef.current.nodes([shapeRef.current])
      trRef.current.getLayer().batchDraw()
    }
  }, [isSelected, layer, model.canMove, shapeRef, trRef])

  return (
    <>
      {layer.visible && (
        <Shape
          {...ownProps}
          draggable={model.canMove && isCurrent}
          width={width}
          height={height}
          offsetY={height / 2}
          offsetX={width / 2}
          x={layer.x || 0}
          y={-layer.y || 0}
          onClick={handleSelect}
          onTap={handleSelect}
          ref={shapeRef}
          strokeWidth={1}
          rotation={layer.rotation || 0}
          sceneFunc={sceneFunc}
          hitFunc={hitFunc}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onTransformStart={handleTransformStart}
          onTransformEnd={handleTransformEnd}
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
    </>
  )
}

export default PreviewLayer
