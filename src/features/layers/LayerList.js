import React, { useCallback } from "react"
import { useTranslation } from "react-i18next"
import Button from "react-bootstrap/Button"
import ListGroup from "react-bootstrap/ListGroup"
import { Tooltip } from "react-tooltip"
import { FaEye, FaEyeSlash, FaMask } from "react-icons/fa"
import { useSelector, useDispatch, useStore } from "react-redux"
import { DndContext, useSensor, useSensors, PointerSensor } from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import Layer from "./Layer"
import {
  moveLayer,
  setCurrentLayer,
  selectCurrentLayerId,
  selectSelectedLayer,
  selectNumLayers,
  selectAllLayers,
  selectLayerIds,
  updateLayer,
} from "@/features/layers/layersSlice"
import {
  selectMaskSources,
  selectAllEffects,
  updateEffect,
} from "@/features/effects/effectsSlice"

const LayerRow = React.memo(function LayerRow({
  current,
  selected,
  numLayers,
  layer,
  maskTargetName,
  handleLayerSelected,
  handleToggleLayerVisible,
  t,
}) {
  const usedAsMask = !!maskTargetName
  const { name, id, visible } = layer
  const activeClass = current ? "active" : selected ? "selected" : ""
  const dragClass = numLayers > 1 ? "cursor-move" : ""
  const visibleClass = visible ? "" : "layer-hidden"
  const instance = new Layer(layer.type)
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useSortable({
      id,
    })
  const style = {
    transform: `translate3d(${transform?.x || 0}px, ${transform?.y || 0}px, 0)`,
    cursor: isDragging ? "grabbing" : "grab",
  }
  const tooltipId = `tooltip-toggle-visible-${layer.id}`

  return (
    <ListGroup.Item
      className={`layer p-0 ${activeClass} ${dragClass} ${visibleClass}`}
      key={id}
      id={id}
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      <Tooltip id={tooltipId} />
      <div
        className={`d-flex align-items-center ms-1 me-2`}
        onClick={handleLayerSelected}
      >
        <div className="layer-left">
          {usedAsMask ? (
            <span className="layer-icon">
              <FaMask />
            </span>
          ) : (
            <Button
              className="layer-button"
              variant="light"
              data-id={id}
              data-tooltip-content={visible ? t("Hide layer") : t("Show layer")}
              data-tooltip-id={tooltipId}
              data-tooltip-place="top-end"
              onClick={(e) => {
                handleToggleLayerVisible(id, layer.visible)
              }}
            >
              {visible ? <FaEye size="0.8em" /> : <FaEyeSlash size="0.8em" />}
            </Button>
          )}
        </div>

        <div className="d-flex no-select flex-grow-1 align-items-center">
          <div>{name}</div>
          <div className="flex-grow-1" />
          <span
            className="me-2"
            style={{ fontSize: "80%" }}
          >
            {t(instance.model.label)}
          </span>
        </div>
      </div>
    </ListGroup.Item>
  )
})

const LayerList = () => {
  const { t } = useTranslation()
  const store = useStore()
  // row has to be dragged 3 pixels before dragging starts; this allows the buttons
  // on the row to work properly.
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
  )
  const dispatch = useDispatch()
  const currentLayerId = useSelector(selectCurrentLayerId)
  const selectedLayer = useSelector(selectSelectedLayer)
  const numLayers = useSelector(selectNumLayers)
  const layers = useSelector(selectAllLayers)
  const maskSources = useSelector(selectMaskSources)

  const layersById = Object.fromEntries(layers.map((l) => [l.id, l]))

  const handleLayerSelected = useCallback(
    (event) => {
      const id = event.target.closest(".list-group-item").id
      dispatch(setCurrentLayer(id))
    },
    [dispatch],
  )

  const handleDragStart = useCallback(
    ({ active }) => dispatch(setCurrentLayer(active.id)),
    [dispatch],
  )

  const handleToggleLayerVisible = useCallback(
    (id, visible) => {
      dispatch(setCurrentLayer(id))
      dispatch(updateLayer({ id, visible: !visible }))
    },
    [dispatch],
  )

  const handleDragEnd = useCallback(
    ({ active, over }) => {
      if (!over) {
        return
      }
      if (active.id !== over.id) {
        const oldIndex = layers.findIndex((layer) => layer.id === active.id)
        const newIndex = layers.findIndex((layer) => layer.id === over.id)
        dispatch(moveLayer({ oldIndex, newIndex }))

        const state = store.getState()
        const newLayerIds = selectLayerIds(state)
        const effects = selectAllEffects(state)

        effects
          .filter(
            (e) =>
              e.type === "mask" && e.maskMachine === "layer" && e.maskLayerId,
          )
          .forEach((effect) => {
            const targetIdx = newLayerIds.indexOf(effect.layerId)
            const sourceIdx = newLayerIds.indexOf(effect.maskLayerId)

            if (sourceIdx === -1 || sourceIdx >= targetIdx) {
              dispatch(updateLayer({ id: effect.maskLayerId, visible: true }))
              dispatch(updateEffect({ id: effect.id, maskLayerId: null }))
            }
          })
      }
    },
    [dispatch, layers, store],
  )

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToVerticalAxis]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={layers.map((layer) => layer.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="overflow-auto border">
          <ListGroup
            variant="flush"
            id="layers"
            style={{ maxHeight: "200px" }}
          >
            {layers.map((layer, index) => {
              const targetLayerId = maskSources.get(layer.id)
              const targetLayer = targetLayerId && layersById[targetLayerId]

              return (
                <LayerRow
                  id={layer.id}
                  key={layer.id}
                  current={currentLayerId === layer.id}
                  selected={selectedLayer.id === layer.id}
                  numLayers={numLayers}
                  layer={layer}
                  maskTargetName={targetLayer?.name}
                  handleLayerSelected={handleLayerSelected}
                  handleToggleLayerVisible={handleToggleLayerVisible}
                  index={index}
                  t={t}
                />
              )
            })}
          </ListGroup>
        </div>
      </SortableContext>
    </DndContext>
  )
}

export default React.memo(LayerList)
