import React from "react"
import Button from "react-bootstrap/Button"
import ListGroup from "react-bootstrap/ListGroup"
import { Tooltip } from "react-tooltip"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { useSelector, useDispatch } from "react-redux"
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
  updateLayer,
} from "@/features/layers/layersSlice"

const LayerRow = ({
  current,
  selected,
  numLayers,
  layer,
  handleLayerSelected,
  handleToggleLayerVisible,
}) => {
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
          <Button
            className="layer-button"
            variant="light"
            data-id={id}
            data-tooltip-content={visible ? "Hide layer" : "Show layer"}
            data-tooltip-id={tooltipId}
            data-tooltip-place="top-end"
            onClick={(e) => {
              handleToggleLayerVisible(id, layer.visible)
            }}
          >
            {visible ? <FaEye size="0.8em" /> : <FaEyeSlash size="0.8em" />}
          </Button>
        </div>

        <div className="d-flex no-select flex-grow-1 align-items-center">
          <div className="flex-grow-1">{name}</div>
          <span
            className="me-2"
            style={{ fontSize: "80%" }}
          >
            {instance.model.label}
          </span>
        </div>
      </div>
    </ListGroup.Item>
  )
}

const LayerList = () => {
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

  const handleLayerSelected = (event) => {
    const id = event.target.closest(".list-group-item").id
    dispatch(setCurrentLayer(id))
  }

  const handleDragStart = ({ active }) => dispatch(setCurrentLayer(active.id))

  const handleToggleLayerVisible = (id, visible) => {
    dispatch(setCurrentLayer(id))
    dispatch(updateLayer({ id, visible: !visible }))
  }

  const handleDragEnd = ({ active, over }) => {
    if (!over) {
      return
    }
    if (active.id !== over.id) {
      const oldIndex = layers.findIndex((layer) => layer.id === active.id)
      const newIndex = layers.findIndex((layer) => layer.id === over.id)
      dispatch(moveLayer({ oldIndex, newIndex }))
    }
  }

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
            {layers.map((layer, index) => (
              <LayerRow
                id={layer.id}
                key={layer.id}
                current={currentLayerId === layer.id}
                selected={selectedLayer.id === layer.id}
                numLayers={numLayers}
                layer={layer}
                handleLayerSelected={handleLayerSelected}
                handleToggleLayerVisible={handleToggleLayerVisible}
                index={index}
              />
            ))}
          </ListGroup>
        </div>
      </SortableContext>
    </DndContext>
  )
}

export default React.memo(LayerList)
