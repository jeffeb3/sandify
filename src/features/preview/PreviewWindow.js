import React, { useEffect, useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import { isEqual } from "lodash"
import { Stage, Layer, Circle, Rect } from "react-konva"
import throttle from "lodash/throttle"
import { selectPreviewState } from "@/features/preview/previewSlice"
import { selectCurrentMachine } from "@/features/machines/machinesSlice"
import { getMachine } from "@/features/machines/machineFactory"
import {
  selectSelectedLayer,
  selectVisibleLayerIds,
  setCurrentLayer,
} from "@/features/layers/layersSlice"
import ShapePreview from "./ShapePreview"
import ConnectorPreview from "./ConnectorPreview"
import { setPreviewSize, selectPreviewZoom } from "./previewSlice"

const PreviewWindow = () => {
  const dispatch = useDispatch()
  const machine = useSelector(selectCurrentMachine)
  const machineInstance = getMachine(machine)
  const { canvasWidth, canvasHeight } = useSelector(selectPreviewState)
  const selectedLayer = useSelector(selectSelectedLayer, isEqual)
  const layerIds = useSelector(selectVisibleLayerIds, isEqual)
  const zoom = useSelector(selectPreviewZoom)
  const stageZoom = zoom > 1 ? zoom : 1
  const offsetZoom = zoom > 1 ? 1 : zoom
  const remainingLayerIds = layerIds.filter((id) => id !== selectedLayer?.id)
  const layerRef = useRef()
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

      if (canvasWidth !== width || canvasHeight !== height) {
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
  }, [])

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

  // add hidden debugging option to toggle the hit canvas on the layer when the user
  // clicks on the layer while pressing the Alt key
  const handleStageClick = (e) => {
    dispatch(setCurrentLayer(null))
    if (e.evt.altKey && layerRef.current) {
      layerRef.current.toggleHitCanvas()
      e.cancelBubble = true
    }
  }

  // some awkward rendering to put the current layer as the last child in the layer to ensure
  // transformer rotation works; this is a Konva restriction.
  return (
    <Stage
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
      </Layer>
    </Stage>
  )
}

export default React.memo(PreviewWindow)
