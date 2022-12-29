import React from 'react'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'
import { Button, ListGroup } from 'react-bootstrap'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

const SortableEffect = SortableElement((
  {
    active,
    numLayers,
    effect,
    onEffectSelected,
    onEffectMoved,
    onSortStarted,
    onToggleLayerOpen,
    onToggleLayerVisible
  }) => {
    const { name, id, visible } = effect
    const activeClass = active ? 'active' : ''
    const dragClass = numLayers > 1 ? 'cursor-move' : ''
    const visibleClass = visible ? '' : 'layer-hidden'

    return <ListGroup.Item
      className={[activeClass, dragClass,  visibleClass, 'layer p-0'].join(' ')}
      key={id}
      id={id}
    >
      <div
        className={[`layer-${activeClass}`, 'd-flex align-items-center'].join(' ')}
        onClick={onEffectSelected}
      >
        <div className="layer-left">
          <Button
            className="layer-button"
            variant="light"
            data-id={id}
            //onClick={onToggleLayerVisible.bind(this, id)}
          >
            {visible && <FaEye size="0.8em" />}
            {!visible && <FaEyeSlash size="0.8em" />}
          </Button>
        </div>

        <div className="no-select">
           {name}
        </div>
      </div>
    </ListGroup.Item>
  }
)

const SortableEffects = SortableContainer((props) => {
  const {
    effectState,
    effects,
    ...other
  } = props

  return (
    <ListGroup
      variant="flush"
      style={{maxHeight: "240px"}}
      className="border overflow-auto"
      id="playlist-group"
    >
      {effects.map((effect, index) => {
        return (
          <SortableEffect
            key={effect.id}
            id={effect.id}
            index={index}
            active={effectState.id === effect.id}
            effect={effect}
            {...other}
          />
        )
      })}
    </ListGroup>
  )
})

export default SortableEffects
