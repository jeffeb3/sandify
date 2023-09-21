import React, { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Shape, Transformer } from "react-konva"
import { isEqual } from "lodash"
import {
  selectCurrentEffectId,
  selectEffectById,
  selectEffectSelectionVertices,
  updateEffect,
} from "@/features/effects/effectsSlice"
import {
  selectLayerById,
  selectDraggingEffectVertices,
  selectIsUpstreamEffectDragging,
} from "@/features/layers/layersSlice"
import { getEffect } from "@/features/effects/effectFactory"
import { roundP, scaleByWheel } from "@/common/util"
import PreviewHelper from "./PreviewHelper"
import { log } from "@/common/debugging"
import colors from "@/common/colors"

const EffectPreview = (ownProps) => {
  log(`EffectPreview render ${ownProps.id}`)
  const dispatch = useDispatch()
  const currentEffectId = useSelector(selectCurrentEffectId)
  const effect = useSelector(
    (state) => selectEffectById(state, ownProps.id),
    isEqual,
  )
  const layer = useSelector((state) => selectLayerById(state, effect?.layerId))
  const vertices = useSelector((state) =>
    selectEffectSelectionVertices(state, ownProps.id),
  )
  const draggingVertices = useSelector((state) =>
    selectDraggingEffectVertices(state, effect?.layerId, ownProps.id),
  )
  const upstreamIsDragging = useSelector((state) =>
    selectIsUpstreamEffectDragging(state, ownProps.id),
  )

  const shapeRef = React.useRef()
  const trRef = React.useRef()
  const isCurrent = effect?.id === currentEffectId
  const model = getEffect(effect?.type || "mask")

  useEffect(() => {
    if (
      effect?.visible &&
      layer?.visible &&
      isCurrent &&
      model.canChangeSize(effect)
    ) {
      trRef.current.nodes([shapeRef.current])
      trRef.current.getLayer().batchDraw()
    }
  }, [isCurrent, effect, layer, model.canMove(effect), shapeRef, trRef])

  if (!effect) {
    // "zombie child" situation; the hooks (above) are able to deal with a
    // null effect. If we're a zombie, we do not need to render.
    return null
  }

  const { width, height } = effect
  const helper = new PreviewHelper({ layer: effect })
  const { selectedShapeColor, activeEffectColor } = colors

  const drawLayerVertices = (context, color) => {
    context.beginPath()
    context.lineWidth = 1
    context.strokeStyle = color
    helper.moveTo(context, vertices[0])
    context.stroke()

    context.beginPath()
    for (let i = 1; i < vertices.length; i++) {
      helper.moveTo(context, vertices[i - 1])
      helper.lineTo(context, vertices[i])
    }
    context.stroke()
  }

  const drawDraggingVertices = (context) => {
    let currentColor = activeEffectColor

    context.beginPath()
    context.lineWidth = 1
    context.strokeStyle = currentColor
    helper.moveTo(context, draggingVertices[0])
    context.stroke()

    context.beginPath()
    for (let i = 1; i < draggingVertices.length; i++) {
      helper.moveTo(context, draggingVertices[i - 1])
      helper.lineTo(context, draggingVertices[i])
    }
    context.stroke()
  }

  const sceneFunc = (context, shape) => {
    if (vertices && vertices.length > 0) {
      if (isCurrent) {
        drawLayerVertices(context, selectedShapeColor)
      } else if (upstreamIsDragging) {
        drawLayerVertices(context, activeEffectColor)
      }
    }

    if (
      isCurrent &&
      effect.dragging &&
      draggingVertices &&
      draggingVertices.length > 0
    ) {
      drawDraggingVertices(context)
    }

    context.fillStrokeShape(shape)
  }

  function hitFunc(context, shape) {
    if (isCurrent) {
      const width = shape.getAttr("width")
      const height = shape.getAttr("height")
      const x = shape.getAttr("x")
      const y = shape.getAttr("y")

      context.rect(x - (effect.x || 0), y + (effect.y || 0), width, height)
      context.fillStrokeShape(this)
    }
  }

  const handleChange = (attrs) => {
    attrs.id = effect.id
    dispatch(updateEffect(attrs))
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

  const handleTransform = (e) => {
    const ref = shapeRef.current
    const scaleX = Math.abs(ref.scaleX())
    const scaleY = Math.abs(ref.scaleY())
    const width = roundP(Math.max(5, effect.width * scaleX), 0)
    const height = roundP(Math.max(5, effect.height * scaleY), 0)
    const originalRotation = roundP(effect.rotation, 0)
    let rotation = roundP(ref.rotation(), 0)

    if (
      (width != effect.width || height != effect.height) &&
      rotation == originalRotation + 180.0 * Math.sign(rotation)
    ) {
      // node has been flipped while scaling
      ref.rotation(originalRotation)
    }

    ref.scaleX(scaleX)
    ref.scaleY(scaleY)
  }

  const handleTransformStart = (e) => {
    if (e.currentTarget === e.target) {
      handleChange({ dragging: true })
    }
  }

  const handleTransformEnd = (e) => {
    if (e.currentTarget === e.target) {
      const node = shapeRef.current
      const width = roundP(
        Math.max(5, effect.width * Math.abs(node.scaleX())),
        0,
      )
      const height = roundP(
        Math.max(5, effect.height * Math.abs(node.scaleY())),
        0,
      )
      const rotation = roundP(node.rotation(), 0)

      node.scaleX(1)
      node.scaleY(1)

      handleChange({
        dragging: false,
        width,
        height,
        rotation,
      })
    }
  }

  const handleWheel = (e) => {
    if (isCurrent) {
      e.evt.preventDefault()

      const deltaX = e.evt.deltaX
      const deltaY = e.evt.deltaY

      if (Math.abs(deltaX) > 0 || Math.abs(deltaY) > 0) {
        dispatch(
          updateEffect({
            width: scaleByWheel(effect.width, deltaX, deltaY),
            height: scaleByWheel(effect.height, deltaX, deltaY),
            id: effect.id,
          }),
        )
      }
    }
  }

  // some effects never render anything
  if (!(height === 0 || height) && !(width === 0 || width)) {
    return null
  }

  return (
    <>
      {effect.visible && (
        <Shape
          {...ownProps}
          draggable={model.canMove(effect) && isCurrent}
          width={width}
          height={height}
          offsetY={height / 2}
          offsetX={width / 2}
          x={effect.x || 0}
          y={-effect.y || 0}
          ref={shapeRef}
          strokeWidth={1}
          rotation={effect.rotation || 0}
          sceneFunc={sceneFunc}
          hitFunc={hitFunc}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onTransformStart={handleTransformStart}
          onTransformEnd={handleTransformEnd}
          onWheel={handleWheel}
        />
      )}
      {effect.visible &&
        layer?.visible &&
        isCurrent &&
        model.canChangeSize(effect) && (
          <Transformer
            ref={trRef}
            centeredScaling={true}
            borderStroke="white"
            resizeEnabled={model.canChangeSize(effect)}
            rotateEnabled={model.canRotate(effect)}
            rotationSnaps={[0, 90, 180, 270]}
            enabledAnchors={
              effect.maintainAspectRatio
                ? ["top-left", "top-right", "bottom-left", "bottom-right"]
                : null
            }
            onTransform={handleTransform}
          />
        )}
    </>
  )
}

export default React.memo(EffectPreview)
