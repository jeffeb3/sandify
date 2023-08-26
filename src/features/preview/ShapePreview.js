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
  selectVisibleLayerEffects,
  selectShapePreviewVertices,
  selectShapeWhileEffectDraggingVertices,
  selectPreviewVertices,
  selectSliderColors,
  selectVertexOffsets,
  selectSliderBounds,
  selectLayerPreviewBounds,
  setCurrentLayer,
} from "@/features/layers/layersSlice"
import { selectCurrentEffectId } from "@/features/effects/effectsSlice"
import EffectLayer from "@/features/effects/EffectLayer"
import { selectPreviewSliderValue } from "@/features/preview/previewSlice"
import EffectPreview from "@/features/preview/EffectPreview"
import { getShapeFromType } from "@/features/shapes/factory"
import { roundP, scaleByWheel } from "@/common/util"
import PreviewHelper from "./PreviewHelper"
import { log } from "@/common/debugging"
import colors from "@/common/colors"

const ShapePreview = (ownProps) => {
  log(`ShapePreview render ${ownProps.id}`)
  const dispatch = useDispatch()
  const currentLayerId = useSelector(selectCurrentLayerId)
  const currentEffectId = useSelector(selectCurrentEffectId)
  const visibleEffects = useSelector(
    (state) => selectVisibleLayerEffects(state, ownProps.id),
    isEqual,
  )
  const layer = useSelector(
    (state) => selectLayerById(state, ownProps.id),
    isEqual,
  )
  const activeEffect = useSelector(
    (state) => selectActiveEffect(state, ownProps.id),
    isEqual,
  )
  const remainingEffectIds = layer.effectIds.filter(
    (id) => id !== activeEffect?.id,
  )
  const activeEffectInstance = activeEffect
    ? new EffectLayer(activeEffect.type)
    : null

  const index = useSelector((state) => selectLayerIndex(state, ownProps.id))
  const numLayers = useSelector(selectNumVisibleLayers)
  const sliderValue = useSelector(selectPreviewSliderValue)
  const layerVertices = useSelector((state) =>
    selectPreviewVertices(state, ownProps.id),
  )
  const effectDraggingVertices = useSelector((state) =>
    selectShapeWhileEffectDraggingVertices(
      state,
      ownProps.id,
      activeEffect?.id,
    ),
  )
  const shapePreviewVertices = useSelector((state) =>
    selectShapePreviewVertices(state, ownProps.id),
  )
  const sliderColors = useSelector(selectSliderColors, isEqual)
  const offsets = useSelector(selectVertexOffsets, isEqual)
  const sliderBounds = useSelector(selectSliderBounds, isEqual)
  const layerBounds = useSelector(
    (state) => selectLayerPreviewBounds(state, ownProps.id),
    isEqual,
  )

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
  }, [
    isCurrent,
    activeEffect,
    layer,
    layer && model.canMove(layer),
    groupRef,
    trRef,
  ])

  if (!layer) {
    // "zombie child" situation; the hooks (above) are able to deal with a
    // null layer. If we're a zombie, we do not need to render.
    return null
  }

  const {
    selectedShapeColor,
    activeEffectColor,
    endPointColor,
    startPointColor,
    unselectedShapeColor,
    noSelectionColor,
    slidingColor,
    transformerBorderColor,
  } = colors
  const isFirstLayer = index === 0
  const isLastLayer = index === numLayers - 1
  const { width, height } = layer
  const isSliding = sliderValue !== 0
  const helper = new PreviewHelper({
    layer,
    layerVertices,
    offsets,
    offsetId: layer.id,
    start: index === 0,
    end: index === numLayers - 1,
    bounds: sliderBounds,
    colors: sliderColors,
    vertices: layerVertices,
  })

  const drawLayerVertices = (context, bounds) => {
    const { end } = bounds
    let oldColor = null
    let currentColor

    if (isCurrent) {
      currentColor = selectedShapeColor
    } else if (activeEffect) {
      currentColor = activeEffectColor
    } else if (layer.dragging || currentLayerId || currentEffectId) {
      currentColor = unselectedShapeColor
    } else {
      currentColor = noSelectionColor
    }

    context.beginPath()
    context.lineWidth = 1
    context.strokeStyle = currentColor
    helper.moveTo(context, layerVertices[0])
    context.stroke()

    context.beginPath()
    for (let i = 1; i < layerVertices.length; i++) {
      if (isSliding) {
        let absoluteI = i + offsets[layer.id].start
        let pathColor = absoluteI <= end ? slidingColor : unselectedShapeColor

        currentColor = sliderColors[absoluteI] || pathColor
        if (currentColor !== oldColor) {
          context.stroke()
          context.strokeStyle = currentColor
          oldColor = currentColor
          context.beginPath()
        }
      }

      helper.moveTo(context, layerVertices[i - 1])
      helper.lineTo(context, layerVertices[i])
    }
    context.stroke()
  }

  const drawVertices = (context, vertices, color, lineWidth = 1) => {
    context.beginPath()
    context.lineWidth = lineWidth
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

  const drawLayerStartAndEndPoints = (context) => {
    const start = layerVertices[0]
    const end = layerVertices[layerVertices.length - 1]

    context.beginPath()
    context.strokeStyle = startPointColor
    helper.dot(context, start, start ? 5 : 3)
    helper.markOriginalCoordinates(context, start)

    context.beginPath()
    context.strokeStyle = endPointColor
    helper.dot(context, end, end ? 5 : 3)
    helper.markOriginalCoordinates(context, end)
  }

  const drawStartAndEndPoints = (context) => {
    const start = layerVertices[0]
    const end = layerVertices[layerVertices.length - 1]

    if (isFirstLayer) {
      context.beginPath()
      context.strokeStyle = startPointColor
      helper.dot(context, start, start ? 5 : 3)
      helper.markOriginalCoordinates(context, start)
    }

    if (isLastLayer) {
      context.beginPath()
      context.strokeStyle = endPointColor
      helper.dot(context, end, end ? 5 : 3)
      helper.markOriginalCoordinates(context, end)
    }
  }

  const sceneFunc = (context, shape) => {
    if (layerVertices && layerVertices.length > 0) {
      if (!isSliding && isCurrent && visibleEffects.length > 0) {
        drawVertices(context, shapePreviewVertices, activeEffectColor)
      }

      if (activeEffect && activeEffect.dragging) {
        if (!activeEffectInstance.model.dragPreview) {
          drawVertices(context, effectDraggingVertices, activeEffectColor)
        }
      } else {
        drawLayerVertices(context, sliderBounds)
      }

      if (isCurrent) {
        drawLayerStartAndEndPoints(context)
      } else if (!currentLayerId && !currentEffectId) {
        drawStartAndEndPoints(context)
      }

      if (isSliding) {
        helper.drawSliderEndPoint(context)
      }
    }

    context.fillStrokeShape(shape)
  }

  // determines whether a layer is selected when it is clicked; based on the outer bounds of
  // the layer, including all of its effects
  function hitFunc(context, shape) {
    const offsetX = (layerBounds[1].x + layerBounds[0].x) / 2
    const offsetY = (layerBounds[1].y + layerBounds[0].y) / 2
    const width = layerBounds[1].x - layerBounds[0].x
    const height = layerBounds[1].y - layerBounds[0].y
    const offsetWidth = (width - shape.getAttr("width")) / 2
    const offsetHeight = (height - shape.getAttr("height")) / 2

    context.beginPath()
    context.rect(offsetX - offsetWidth, -offsetY - offsetHeight, width, height)
    context.closePath()
    context.fillStrokeShape(shape)
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

  const handleClick = (e) => {
    dispatch(setCurrentLayer(ownProps.id))
    e.cancelBubble = true // don't bubble this up to the preview window
  }

  // Order of these layers is very important. The current layer or effect must always
  // be the last one in order for Konva to allow dragging and transformer manipulation.
  // That's why this looks a little weird.
  return (
    <Group>
      {remainingEffectIds.map((id, i) => {
        return (
          <Group
            x={layer.x || 0}
            y={-layer.y || 0}
            rotation={layer.rotation || 0}
            key={`group-${id}`}
          >
            <EffectPreview
              id={id}
              key={id}
              index={i}
            />
          </Group>
        )
      })}
      <Group
        ref={groupRef}
        x={layer.x || 0}
        y={-layer.y || 0}
        rotation={layer.rotation || 0}
        onTransformStart={handleTransformStart}
        onTransformEnd={handleTransformEnd}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        draggable={model.canMove(layer) && isCurrent}
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
            onClick={handleClick}
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
          borderStroke={transformerBorderColor}
          centeredScaling={true}
          resizeEnabled={model.canChangeSize(layer)}
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