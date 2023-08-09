import React, { useEffect, useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import { isEqual } from "lodash"
import { Stage, Layer, Circle, Rect } from "react-konva"
import throttle from "lodash/throttle"
import { selectPreviewState } from "@/features/preview/previewSlice"
import { selectMachine } from "@/features/machine/machineSlice"
import {
  selectKonvaLayerIds,
  selectVisibleLayerIds,
  selectIsDragging,
} from "@/features/layers/layersSlice"
import PreviewLayer from "./PreviewLayer"
import PreviewConnector from "./PreviewConnector"
import { setPreviewSize } from "./previewSlice"

const PreviewWindow = () => {
  const dispatch = useDispatch()
  const previewElement = useRef(null)
  const { rectangular, minX, minY, maxX, maxY, maxRadius } =
    useSelector(selectMachine)
  const { canvasWidth, canvasHeight } = useSelector(selectPreviewState)
  const konvaIds = useSelector(selectKonvaLayerIds, isEqual)
  const layerIds = useSelector(selectVisibleLayerIds, isEqual)
  const dragging = useSelector(selectIsDragging)

  useEffect(() => {
    const wrapper = document.getElementById("preview-wrapper")
    const resize = () => {
      const width = parseInt(
        getComputedStyle(wrapper).getPropertyValue("width"),
      )
      const height = parseInt(
        getComputedStyle(wrapper).getPropertyValue("height"),
      )

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

    return Math.min(canvasWidth / width, canvasHeight / height)
  }

  const clipCircle = (ctx) => {
    ctx.arc(0, 0, maxRadius, 0, Math.PI * 2, false)
  }

  const clipRect = (ctx) => {
    ctx.rect(-width / 2, -height / 2, width, height)
  }

  const clipFunc = dragging ? (rectangular ? clipRect : clipCircle) : null
  const width = rectangular ? maxX - minX : maxRadius * 2
  const height = rectangular ? maxY - minY : maxRadius * 2
  const scale = relativeScale()

  return (
    <Stage
      id="preview-wrapper"
      ref={previewElement}
      className="preview-wrapper d-flex align-items-center"
      scaleX={scale}
      scaleY={scale}
      height={height * scale}
      width={width * scale}
      offsetX={-width / 2}
      offsetY={-height / 2}
    >
      <Layer clipFunc={clipFunc}>
        {!rectangular && (
          <Circle
            x={0}
            y={0}
            radius={maxRadius}
            fill="transparent"
            stroke="gray"
          />
        )}
        {rectangular && (
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="transparent"
            stroke="gray"
            offsetX={width / 2}
            offsetY={height / 2}
          />
        )}
        {konvaIds.map((id, i) => {
          const idx = layerIds.findIndex((layerId) => layerId === id)
          const nextId =
            idx !== -1 && idx < layerIds.length - 1 ? layerIds[idx + 1] : null
          return [
            nextId && (
              <PreviewConnector
                startId={id}
                endId={nextId}
                key={"c-" + i}
              />
            ),
            <PreviewLayer
              id={id}
              key={i}
              index={i}
            />,
          ].filter((e) => e !== null)
        })}
      </Layer>
    </Stage>
  )
}

export default React.memo(PreviewWindow)
