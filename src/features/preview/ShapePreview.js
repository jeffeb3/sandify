import React, { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Shape, Transformer, Group } from "react-konva"
import { isEqual } from "lodash"
import {
  updateLayer,
  selectCurrentLayerId,
  selectLayerIndex,
  selectLayerById,
  selectNumVisibleLayers,
  selectActiveEffect,
  selectPreviewVertices,
  selectSliderColors,
  selectVertexOffsets,
  selectSliderBounds,
} from "@/features/layers/layersSlice"
import { selectPreviewSliderValue } from "@/features/preview/previewSlice"
import EffectPreview from "@/features/preview/EffectPreview"
import { getShapeFromType } from "@/features/shapes/factory"
import { roundP, scaleByWheel } from "@/common/util"
import PreviewHelper from "./PreviewHelper"
import { log } from "@/common/debugging"

const ShapePreview = (ownProps) => {
  log(`ShapePreview render ${ownProps.id}`)
  const dispatch = useDispatch()
  const currentLayerId = useSelector(selectCurrentLayerId)
  const activeEffect = useSelector(
    (state) => selectActiveEffect(state, ownProps.id),
    isEqual,
  )
  const layer = useSelector((state) => selectLayerById(state, ownProps.id))
  const index = useSelector((state) => selectLayerIndex(state, ownProps.id))
  const numLayers = useSelector(selectNumVisibleLayers)
  const sliderValue = useSelector(selectPreviewSliderValue)
  const vertices = useSelector((state) =>
    selectPreviewVertices(state, ownProps.id),
  )
  const colors = useSelector(selectSliderColors, isEqual)
  const offsets = useSelector(selectVertexOffsets, isEqual)
  const bounds = useSelector(selectSliderBounds, isEqual)

  const shapeRef = React.useRef()
  const groupRef = React.useRef()
  const trRef = React.useRef()
  const isCurrent = layer?.id === currentLayerId
  const model = getShapeFromType(layer?.type || "polygon")

  useEffect(() => {
    if (layer?.visible && isCurrent && model.canChangeSize(layer)) {
      trRef.current.nodes([groupRef.current])
      trRef.current.getLayer().batchDraw()
    }
  }, [isCurrent, activeEffect, layer, model.canMove, groupRef, trRef])

  if (!layer) {
    // "zombie child" situation; the hooks (above) are able to deal with a
    // null layer. If we're a zombie, we do not need to render.
    return null
  }

  const start = index === 0
  const end = index === numLayers - 1
  const { width, height } = layer
  const selectedColor = "yellow"
  const unselectedColor = "rgba(195, 214, 230, 0.65)"
  const backgroundSelectedColor = "#6E6E00"
  const backgroundUnselectedColor = "rgba(195, 214, 230, 0.4)"
  const isSliding = sliderValue !== 0
  const helper = new PreviewHelper({ layer, vertices, offsets, bounds, colors })

  const drawLayerVertices = (context, bounds) => {
    const { end } = bounds
    let oldColor = null
    let currentColor = isCurrent ? selectedColor : unselectedColor

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

      if (start || end || isCurrent) {
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

  const handleDragStart = (e) => {
    if (e.currentTarget === e.target) {
      if (isCurrent) {
        handleChange({ dragging: true })
      }
    }
  }

  const handleDragEnd = (e) => {
    if (e.currentTarget === e.target) {
      handleChange({
        dragging: false,
        x: roundP(e.target.x(), 0),
        y: roundP(-e.target.y(), 0),
      })
    }
  }

  const handleTransformStart = (e) => {
    if (e.currentTarget === e.target) {
      handleChange({ dragging: true })
    }
  }

  const handleTransformEnd = (e) => {
    if (e.currentTarget === e.target) {
      const node = groupRef.current
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
  }

  const handleWheel = (e) => {
    if (isCurrent) {
      e.evt.preventDefault()

      if (Math.abs(e.evt.deltaY) > 0) {
        dispatch(
          updateLayer({
            width: scaleByWheel(layer.width, e.evt.deltaY),
            height: scaleByWheel(layer.height, e.evt.deltaY),
            id: layer.id,
          }),
        )
      }
    }
  }

  return (
    <Group>
      <Group
        ref={groupRef}
        x={layer.x || 0}
        y={-layer.y || 0}
        rotation={layer.rotation || 0}
        onTransformStart={handleTransformStart}
        onTransformEnd={handleTransformEnd}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        draggable={model.canMove && isCurrent}
      >
        {layer.visible && (
          <Shape
            {...ownProps}
            width={width}
            height={height}
            offsetY={height / 2}
            offsetX={width / 2}
            ref={shapeRef}
            strokeWidth={1}
            sceneFunc={sceneFunc}
            hitFunc={hitFunc}
            onWheel={handleWheel}
          />
        )}
        {activeEffect && (
          <EffectPreview
            id={activeEffect.id}
            key={activeEffect.id}
          />
        )}
      </Group>
      {layer.visible && isCurrent && model.canChangeSize(layer) && (
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
    </Group>
  )
}

export default React.memo(ShapePreview)
