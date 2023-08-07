import React, { useState } from "react"
import { Button } from "react-bootstrap"
import { useSelector, useDispatch } from "react-redux"
import { Card, Accordion } from "react-bootstrap"
import { FaTrash, FaCopy, FaPlusSquare } from "react-icons/fa"
import {
  selectCurrentLayer,
  selectLayerEffects,
  deleteEffect,
  moveEffect,
} from "@/features/layers/layersSlice"
import {
  selectCurrentEffect,
  setCurrentEffect,
  updateEffect,
} from "./effectsSlice"
import EffectEditor from "./EffectEditor"
import EffectList from "./EffectList"
import NewEffect from "./NewEffect"

const EffectManager = () => {
  const dispatch = useDispatch()
  const currentLayer = useSelector(selectCurrentLayer)
  const currentEffect = useSelector(selectCurrentEffect)
  const effects = useSelector((state) =>
    selectLayerEffects(state, currentLayer.id),
  )
  const numEffects = effects.length
  const [showNewEffect, setShowNewEffect] = useState(false)

  const toggleNewEffectModal = () => setShowNewEffect(!showNewEffect)

  const handleToggleEffectVisible = (id) =>
    dispatch(updateEffect({ id, visible: !currentEffect.visible }))

  const handleEffectSelected = (event) => {
    const id = event.target.closest(".list-group-item").id
    dispatch(setCurrentEffect(id))
  }

  const handleEffectDeleted = (id) => {
    dispatch(
      deleteEffect({
        id: currentLayer.id,
        effectId: currentEffect.id,
      }),
    )
  }

  const handleEffectMoved = ({ oldIndex, newIndex }) =>
    dispatch(moveEffect({ id: currentLayer.id, oldIndex, newIndex }))

  const handleUpdateBeforeSortStart = ({ node }) =>
    dispatch(setCurrentEffect(node.id))

  return (
    <div>
      <NewEffect
        showModal={showNewEffect}
        toggleModal={toggleNewEffectModal}
      />

      {numEffects == 0 && (
        <Button
          className="mt-3"
          variant="secondary"
          onClick={toggleNewEffectModal}
        >
          Add effect
        </Button>
      )}
      {numEffects > 0 && (
        <Accordion
          key={3}
          defaultActiveKey={3}
          className="mt-3"
        >
          <Card>
            <Card.Header className="d-flex">
              <Accordion.Toggle
                as={Button}
                variant="link"
                eventKey={3}
              >
                Effects
              </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey={3}>
              <Card.Body>
                <EffectList
                  pressDelay={150}
                  onSortEnd={handleEffectMoved}
                  updateBeforeSortStart={handleUpdateBeforeSortStart}
                  lockAxis="y"
                  effects={effects}
                  currentEffect={currentEffect}
                  handleEffectSelected={handleEffectSelected}
                  handleToggleEffectVisible={handleToggleEffectVisible}
                />
                <div className="d-flex align-items-center border-left border-right border-bottom">
                  <Button
                    className="ml-2 layer-button"
                    variant="light"
                    size="sm"
                    data-tip="Create new effect"
                    onClick={toggleNewEffectModal}
                  >
                    <FaPlusSquare />
                  </Button>
                  <div className="ml-auto">
                    <Button
                      className="layer-button"
                      variant="light"
                      data-tip="Delete effect"
                      onClick={handleEffectDeleted}
                    >
                      <FaTrash />
                    </Button>
                    <Button
                      className="layer-button"
                      variant="light"
                      data-tip="Copy effect"
                      // onClick={toggleCopyEffect}
                    >
                      <FaCopy />
                    </Button>
                  </div>
                </div>
                <EffectEditor />
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        </Accordion>
      )}
    </div>
  )
}

export default EffectManager
