import React, { useEffect, useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import { isEqual } from "lodash"
import { Stage, Layer, Circle, Rect } from "react-konva"
import throttle from "lodash/throttle"
import { selectPreviewState } from "@/features/preview/previewSlice"
import { selectMachine } from "@/features/machine/machineSlice"
import {
  selectSelectedLayer,
  selectVisibleLayerIds,
  setCurrentLayer,
} from "@/features/layers/layersSlice"
import ShapePreview from "./ShapePreview"
import ConnectorPreview from "./ConnectorPreview"
import { setPreviewSize } from "./previewSlice"

const PreviewWindow = () => {
  const dispatch = useDispatch()
  const { rectangular, minX, minY, maxX, maxY, maxRadius } =
    useSelector(selectMachine)
  const { canvasWidth, canvasHeight } = useSelector(selectPreviewState)
  const selectedLayer = useSelector(selectSelectedLayer, isEqual)
  const layerIds = useSelector(selectVisibleLayerIds, isEqual)
  const remainingLayerIds = layerIds.filter((id) => id !== selectedLayer?.id)
  const layerRef = useRef()

  useEffect(() => {
    const wrapper = document.getElementById("preview-wrapper")
    const resize = () => {
      const width = parseInt(
        getComputedStyle(wrapper).getPropertyValue("width"),
      ) - 22
      const height = parseInt(
        getComputedStyle(wrapper).getPropertyValue("height"),
      ) - 22

      if (canvasWidth !== width || canvasHeight !== height) {
        dispatch(setPreviewSize({ width, height }))
      }
    }
    const throttledResize = throttle(resize, 200, {
      trailing: true,
    })

    window.addEventListener("resize", throttledResize, false)

    return () => {
      window.removeEventListener("resize", throttledResize, false)
    }
  }, [dispatch, canvasWidth, canvasHeight])

  const relativeScale = () => {
    let width, height

    if (rectangular) {
      width = maxX - minX
      height = maxY - minY
    } else {
      width = height = maxRadius * 2.0
    }

    return {
      scaleWidth: canvasWidth / width,
      scaleHeight: canvasHeight / height,
    }
  }

  const width = rectangular ? maxX - minX : maxRadius * 2
  const height = rectangular ? maxY - minY : maxRadius * 2
  const { scaleWidth, scaleHeight } = relativeScale()
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
  const handleLayerClick = (e) => {
    if (e.evt.altKey && layerRef.current) {
      layerRef.current.toggleHitCanvas()
      e.cancelBubble = true
    }
  }

  const handleStageClick = (e) => {
    dispatch(setCurrentLayer(null))
  }

  // some awkward rendering to put the current layer as the last child in the layer to ensure
  // transformer rotation works; this is a Konva restriction.
  return (
    <Stage
      className="d-flex align-items-center"
      scaleX={scale}
      scaleY={scale}
      height={height * scale}
      width={width * scaleWidth}
      offsetX={(-width * (scaleWidth / scale)) / 2}
      offsetY={-height / 2}
      onClick={handleStageClick}
    >
      <Layer
        ref={layerRef}
        onClick={handleLayerClick}
      >
        {!rectangular && (
          <Circle
            x={0}
            y={0}
            radius={maxRadius}
            fill="black"
            stroke="transparent"
          />
        )}
        {rectangular && (
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
