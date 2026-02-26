/* global document, getComputedStyle, window */

import React, { useCallback, useEffect, useRef, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { isEqual } from "lodash"
import { Stage, Layer, Circle, Rect, Line } from "react-konva"
import throttle from "lodash/throttle"
import { selectPreviewState } from "@/features/preview/previewSlice"
import { selectCurrentMachine } from "@/features/machines/machinesSlice"
import { getMachine } from "@/features/machines/machineFactory"
import {
  addLayer,
  selectSelectedLayer,
  selectVisibleLayerIds,
  setCurrentLayer,
} from "@/features/layers/layersSlice"
import ShapePreview from "./ShapePreview"
import ConnectorPreview from "./ConnectorPreview"
import {
  setPreviewSize,
  selectPreviewZoom,
  selectDrawingMode,
  selectDrawingPoints,
  addDrawingPoint,
  exitDrawingMode,
  clearDrawingPoints,
} from "./previewSlice"
import LayerFactory from "@/features/layers/Layer"

const PreviewWindow = ({ isActive }) => {
  const dispatch = useDispatch()
  const machine = useSelector(selectCurrentMachine)
  const machineInstance = getMachine(machine)
  const { canvasWidth, canvasHeight } = useSelector(selectPreviewState)
  const selectedLayer = useSelector(selectSelectedLayer, isEqual)
  const layerIds = useSelector(selectVisibleLayerIds, isEqual)
  const zoom = useSelector(selectPreviewZoom)
  const drawingMode = useSelector(selectDrawingMode)
  const drawingPoints = useSelector(selectDrawingPoints)
  const [isDrawing, setIsDrawing] = useState(false)
  const stageZoom = zoom > 1 ? zoom : 1
  const offsetZoom = zoom > 1 ? 1 : zoom
  const remainingLayerIds = layerIds.filter((id) => id !== selectedLayer?.id)
  const layerRef = useRef()
  const stageRef = useRef()
  const stagePadding = 22

  useEffect(() => {
    const wrapper = document.getElementById("preview-wrapper")
    const resize = () => {
      const width =
        parseInt(getComputedStyle(wrapper).getPropertyValue("width")) -
        2 * stagePadding
      const height =
        parseInt(getComputedStyle(wrapper).getPropertyValue("height")) -
        2 * stagePadding

      if (width > 0 && height > 0) {
        dispatch(setPreviewSize({ width, height }))
      }
    }
    const throttledResize = throttle(resize, 200, {
      trailing: true,
    })

    resize()
    window.addEventListener("resize", throttledResize, false)

    return () => {
      window.removeEventListener("resize", throttledResize, false)
    }
  }, [dispatch, isActive])

  const { width, height } = machineInstance
  const scaleWidth = canvasWidth / width
  const scaleHeight = canvasHeight / height
  const scale = Math.min(scaleWidth, scaleHeight)

  const selectedIdx = layerIds.findIndex(
    (layerId) => layerId === selectedLayer?.id,
  )
  const selectedNextId =
    selectedIdx !== -1 && selectedIdx < layerIds.length - 1
      ? layerIds[selectedIdx + 1]
      : null

  // Get machine coordinates from a pointer event
  const getPointerMachineCoords = useCallback(() => {
    const stage = stageRef.current
    if (!stage) return null
    const pos = stage.getRelativePointerPosition()
    if (!pos) return null
    return { x: pos.x, y: -pos.y } // flip Y: Konva Y-down → Sandify Y-up
  }, [])

  // Drawing event handlers
  const handleDrawStart = useCallback(
    (e) => {
      if (!drawingMode) return
      e.cancelBubble = true
      setIsDrawing(true)
      dispatch(clearDrawingPoints())
      const pt = getPointerMachineCoords()
      if (pt) dispatch(addDrawingPoint(pt))
    },
    [drawingMode, dispatch, getPointerMachineCoords],
  )

  const handleDrawMove = useCallback(
    (e) => {
      if (!drawingMode || !isDrawing) return
      e.cancelBubble = true
      const pt = getPointerMachineCoords()
      if (pt) dispatch(addDrawingPoint(pt))
    },
    [drawingMode, isDrawing, dispatch, getPointerMachineCoords],
  )

  const handleDrawEnd = useCallback(() => {
    if (!drawingMode || !isDrawing) return
    setIsDrawing(false)

    if (drawingPoints.length >= 2) {
      const layer = new LayerFactory("drawing")
      const attrs = layer.getInitialState({
        machine,
        drawingPoints,
      })
      attrs.name = "Drawing"
      dispatch(addLayer(attrs))
    }

    dispatch(exitDrawingMode())
  }, [drawingMode, isDrawing, drawingPoints, machine, dispatch])

  // Normal click handler (deselect layers)
  const handleStageClick = (e) => {
    if (drawingMode) return
    dispatch(setCurrentLayer(null))
    if (e.evt.altKey && layerRef.current) {
      layerRef.current.toggleHitCanvas()
      e.cancelBubble = true
    }
  }

  // Convert drawing points to flat [x1,y1,x2,y2,...] for Konva Line
  const drawingLinePoints = drawingPoints.flatMap((p) => [p.x, -p.y]) // flip Y back for Konva rendering

  const cursorStyle = drawingMode ? "crosshair" : "default"

  // some awkward rendering to put the current layer as the last child in the layer to ensure
  // transformer rotation works; this is a Konva restriction.
  return (
    <Stage
      ref={stageRef}
      scaleX={scale * zoom}
      scaleY={scale * zoom}
      height={height * scaleHeight * stageZoom + stagePadding}
      width={width * scaleWidth * stageZoom + stagePadding}
      offsetX={
        (-width * (scaleWidth / scale / offsetZoom) - stagePadding * 0.5) / 2
      }
      offsetY={
        (-height * (scaleHeight / scale / offsetZoom) - stagePadding * 0.5) / 2
      }
      onClick={handleStageClick}
      onMouseDown={handleDrawStart}
      onMouseMove={handleDrawMove}
      onMouseUp={handleDrawEnd}
      onTouchStart={handleDrawStart}
      onTouchMove={handleDrawMove}
      onTouchEnd={handleDrawEnd}
      style={{ cursor: cursorStyle }}
    >
      <Layer ref={layerRef}>
        {machine.type === "polar" && (
          <Circle
            x={0}
            y={0}
            radius={width / 2}
            fill="black"
            stroke="transparent"
          />
        )}
        {machine.type === "rectangular" && (
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="black"
            stroke="transparent"
            offsetX={width / 2}
            offsetY={height / 2}
          />
        )}
        {[
          remainingLayerIds.map((id, i) => {
            const idx = layerIds.findIndex((layerId) => layerId === id)
            const nextId =
              idx !== -1 && idx < layerIds.length - 1 ? layerIds[idx + 1] : null
            return [
              nextId && (
                <ConnectorPreview
                  startId={id}
                  endId={nextId}
                  key={"c-" + i}
                />
              ),
              <ShapePreview
                id={id}
                key={id}
                index={i}
              />,
            ]
          }),
          selectedNextId && (
            <ConnectorPreview
              startId={selectedLayer.id}
              endId={selectedNextId}
              key="c-first"
            />
          ),
          selectedLayer && (
            <ShapePreview
              id={selectedLayer.id}
              key={selectedLayer.id}
            />
          ),
        ]
          .flat()
          .filter((e) => e !== null)}
        {drawingMode && drawingPoints.length > 0 && (
          <Line
            points={drawingLinePoints}
            stroke="#00ff00"
            strokeWidth={1 / (scale * zoom)}
            lineCap="round"
            lineJoin="round"
          />
        )}
      </Layer>
    </Stage>
  )
}

export default React.memo(PreviewWindow)
