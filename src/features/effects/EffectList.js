import React from "react"
import { useDispatch } from "react-redux"
import { Button, ListGroup } from "react-bootstrap"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { DndContext, useSensor, useSensors, PointerSensor } from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { moveEffect } from "@/features/layers/layersSlice"
import { setCurrentEffect, updateEffect } from "./effectsSlice"

const EffectRow = ({
  active,
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

  return (
    <ListGroup.Item
      className={`layer p-0 ${active ? "active" : ""}`}
      key={id}
      id={id}
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      <div
        className={`layer-${active ? "active" : ""} d-flex align-items-center`}
        onClick={handleEffectSelected}
      >
        <div className="layer-left">
          <Button
            className="layer-button"
            variant="light"
            data-id={id}
            onClick={() => handleToggleEffectVisible(id)}
          >
            {visible ? <FaEye size="0.8em" /> : <FaEyeSlash size="0.8em" />}
          </Button>
        </div>

        <div className="no-select">{name}</div>
      </div>
    </ListGroup.Item>
  )
}

const EffectList = ({ effects, currentEffect, currentLayer }) => {
  const dispatch = useDispatch()

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
    if (active.id !== over.id) {
      const oldIndex = effects.findIndex((effect) => effect.id === active.id)
      const newIndex = effects.findIndex((effect) => effect.id === over.id)
      dispatch(moveEffect({ id: currentLayer.id, oldIndex, newIndex }))
    }
  }

  const handleToggleEffectVisible = (id) =>
    dispatch(updateEffect({ id, visible: !currentEffect.visible }))

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
          className="border overflow-auto"
          id="effects"
        >
          {effects.map((effect, index) => (
            <EffectRow
              id={effect.id}
              key={effect.id}
              active={currentEffect?.id === effect.id}
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
