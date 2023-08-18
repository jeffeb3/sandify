import React from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button, ListGroup } from "react-bootstrap"
import { Tooltip } from "react-tooltip"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { DndContext, useSensor, useSensors, PointerSensor } from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { moveEffect, setCurrentEffect } from "@/features/layers/layersSlice"
import {
  updateEffect,
  selectCurrentEffectId,
  selectSelectedEffectId,
} from "./effectsSlice"

const EffectRow = ({
  current,
  selected,
  effect,
  handleEffectSelected,
  handleToggleEffectVisible,
}) => {
  const { name, id, visible } = effect
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useSortable({
      id,
    })
  const style = {
    transform: `translate3d(${transform?.x || 0}px, ${transform?.y || 0}px, 0)`,
    cursor: isDragging ? "grabbing" : "grab",
  }
  const itemClass = current ? "active" : selected ? "selected" : ""

  return (
    <ListGroup.Item
      className={`layer p-0 ${itemClass}`}
      key={id}
      id={id}
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      <Tooltip id="tooltip-toggle-visible" />
      <div
        className="d-flex align-items-center"
        onClick={handleEffectSelected}
      >
        <div className="layer-left">
          <Button
            className="layer-button"
            variant="light"
            data-id={id}
            data-tooltip-content={visible ? "Hide effect" : "Show effect"}
            data-tooltip-id="tooltip-toggle-visible"
            onClick={() => handleToggleEffectVisible(id, effect.visible)}
          >
            {visible ? <FaEye size="0.8em" /> : <FaEyeSlash size="0.8em" />}
          </Button>
        </div>

        <div className="no-select">{name}</div>
      </div>
    </ListGroup.Item>
  )
}

const EffectList = ({ effects, selectedLayer }) => {
  const dispatch = useDispatch()
  const currentEffectId = useSelector(selectCurrentEffectId)
  const selectedEffectId = useSelector(selectSelectedEffectId)

  // row has to be dragged 3 pixels before dragging starts; this allows the buttons
  // on the row to work properly.
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
  )

  const handleDragStart = ({ active }) => dispatch(setCurrentEffect(active.id))

  const handleDragEnd = ({ active, over }) => {
    if (!over) {
      return
    }
    if (active.id !== over.id) {
      const oldIndex = effects.findIndex((effect) => effect.id === active.id)
      const newIndex = effects.findIndex((effect) => effect.id === over.id)
      dispatch(moveEffect({ id: selectedLayer.id, oldIndex, newIndex }))
    }
  }

  const handleToggleEffectVisible = (id, visible) => {
    dispatch(setCurrentEffect(id))
    dispatch(updateEffect({ id, visible: !visible }))
  }

  const handleEffectSelected = (event) => {
    const id = event.target.closest(".list-group-item").id
    dispatch(setCurrentEffect(id))
  }

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToVerticalAxis]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={effects.map((effect) => effect.id)}
        strategy={verticalListSortingStrategy}
      >
        <ListGroup
          variant="flush"
          style={{ maxHeight: "240px" }}
          className="border overflow-visible"
          id="effects"
        >
          {effects.map((effect, index) => (
            <EffectRow
              id={effect.id}
              key={effect.id}
              current={currentEffectId === effect.id}
              selected={selectedEffectId === effect.id}
              effect={effect}
              handleEffectSelected={handleEffectSelected}
              handleToggleEffectVisible={handleToggleEffectVisible}
              index={index}
            />
          ))}
        </ListGroup>
      </SortableContext>
    </DndContext>
  )
}

export default EffectList
