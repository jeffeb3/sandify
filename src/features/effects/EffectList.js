import React from "react"
import { SortableContainer, SortableElement } from "react-sortable-hoc"
import { Button, ListGroup } from "react-bootstrap"
import { FaEye, FaEyeSlash } from "react-icons/fa"

const EffectRow = SortableElement(
  ({
    active,
    numEffects,
    effect,
    onSortStarted,
    handleEffectSelected,
    handleToggleEffectVisible,
  }) => {
    const { name, id, visible } = effect
    const activeClass = active ? "active" : ""
    const dragClass = numEffects > 1 ? "cursor-move" : ""
    const visibleClass = visible ? "" : "layer-hidden"

    return (
      <ListGroup.Item
        className={[activeClass, dragClass, visibleClass, "layer p-0"].join(
          " ",
        )}
        key={id}
        id={id}
      >
        <div
          className={[`layer-${activeClass}`, "d-flex align-items-center"].join(
            " ",
          )}
          onClick={handleEffectSelected}
        >
          <div className="layer-left">
            <Button
              className="layer-button"
              variant="light"
              data-id={id}
              onClick={handleToggleEffectVisible.bind(this, id)}
            >
              {visible && <FaEye size="0.8em" />}
              {!visible && <FaEyeSlash size="0.8em" />}
            </Button>
          </div>

          <div className="no-select">{name}</div>
        </div>
      </ListGroup.Item>
    )
  },
)

const EffectList = SortableContainer(({ effects, currentEffect, ...other }) => {
  return (
    <ListGroup
      variant="flush"
      style={{ maxHeight: "240px" }}
      className="border overflow-auto"
      id="effects"
    >
      {effects.map((effect, index) => {
        return (
          <EffectRow
            key={effect.id}
            id={effect.id}
            index={index}
            active={currentEffect?.id === effect.id}
            effect={effect}
            currentEffect={currentEffect}
            {...other}
          />
        )
      })}
    </ListGroup>
  )
})

export default EffectList
