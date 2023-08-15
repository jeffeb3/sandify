import React, { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Shape, Transformer } from "react-konva"
import {
  selectCurrentEffectId,
  selectEffectById,
  selectEffectSelectionVertices,
  updateEffect,
} from "@/features/effects/effectsSlice"
import { getEffectFromType } from "@/features/effects/factory"
import { roundP, scaleByWheel } from "@/common/util"
import PreviewHelper from "./PreviewHelper"
import { log } from "@/common/debugging"

const EffectPreview = (ownProps) => {
  log(`EffectPreview render ${ownProps.id}`)
  const dispatch = useDispatch()
  const currentEffectId = useSelector(selectCurrentEffectId)
  const effect = useSelector((state) => selectEffectById(state, ownProps.id))
  const vertices = useSelector((state) =>
    selectEffectSelectionVertices(state, ownProps.id),
  )
  //  const colors = useSelector(selectSliderColors, isEqual)
  //  const offsets = useSelector(selectVertexOffsets, isEqual)
  //  const bounds = useSelector(selectSliderBounds, isEqual)

  const shapeRef = React.useRef()
  const trRef = React.useRef()
  const isCurrent = effect?.id === currentEffectId
  const model = getEffectFromType(effect?.type || "mask")

  useEffect(() => {
    if (effect?.visible && isCurrent && model.canChangeSize(effect)) {
      trRef.current.nodes([shapeRef.current])
      trRef.current.getLayer().batchDraw()
    }
  }, [isCurrent, effect, model.canMove, shapeRef, trRef])

  if (!effect) {
    // "zombie child" situation; the hooks (above) are able to deal with a
    // null effect. If we're a zombie, we do not need to render.
    return null
  }

  const { width, height } = effect
  const helper = new PreviewHelper({ layer: effect })

  const drawLayerVertices = (context) => {
    let currentColor = "rgba(195, 214, 230, 0.65)"

    context.beginPath()
    context.lineWidth = 1
    context.strokeStyle = currentColor
    helper.moveTo(context, vertices[0])
    context.stroke()

    context.beginPath()
    for (let i = 1; i < vertices.length; i++) {
      helper.moveTo(context, vertices[i - 1])
      helper.lineTo(context, vertices[i])
    }
    context.stroke()
  }

  const sceneFunc = (context, shape) => {
    if (isCurrent && vertices && vertices.length > 0) {
      drawLayerVertices(context)
    }

    context.fillStrokeShape(shape)
  }

  function hitFunc(context) {
    context.fillStrokeShape(this)
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

  const handleTransformStart = (e) => {
    if (e.currentTarget === e.target) {
      handleChange({ dragging: true })
    }
  }

  const handleTransformEnd = (e) => {
    if (e.currentTarget === e.target) {
      const node = shapeRef.current
      const scaleX = node.scaleX()
      const scaleY = node.scaleY()

      node.scaleX(1)
      node.scaleY(1)

      handleChange({
        dragging: false,
        width: roundP(Math.max(5, effect.width * scaleX), 0),
        height: roundP(Math.max(5, effect.height * scaleY), 0),
        rotation: roundP(node.rotation(), 0),
      })
    }
  }

  const handleWheel = (e) => {
    if (isCurrent) {
      e.evt.preventDefault()

      if (Math.abs(e.evt.deltaY) > 0) {
        dispatch(
          updateEffect({
            width: scaleByWheel(effect.width, e.evt.deltaY),
            height: scaleByWheel(effect.height, e.evt.deltaY),
            id: effect.id,
          }),
        )
      }
    }
  }

  return (
    <>
      {effect.visible && (
        <Shape
          {...ownProps}
          draggable={model.canMove && isCurrent}
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
      {effect.visible && isCurrent && model.canChangeSize(effect) && (
        <Transformer
          ref={trRef}
          centeredScaling={true}
          resizeEnabled={model.canResize}
          rotateEnabled={model.canRotate(effect)}
          rotationSnaps={[0, 90, 180, 270]}
          enabledAnchors={
            !model.canChangeHeight(effect)
              ? ["top-left", "top-right", "bottom-left", "bottom-right"]
              : null
          }
        />
      )}
    </>
  )
}

export default React.memo(EffectPreview)
