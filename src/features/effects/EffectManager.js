import React, { useState } from "react"
import Button from "react-bootstrap/Button"
import Accordion from "react-bootstrap/Accordion"
import { Tooltip } from "react-tooltip"
import { useSelector, useDispatch } from "react-redux"
import { FaTrash, FaCopy, FaPlusSquare, FaDiceFive } from "react-icons/fa"
import { MdOutlineSettingsBackupRestore } from "react-icons/md"
import {
  selectSelectedLayer,
  deleteEffect,
  selectLayerEffects,
} from "@/features/layers/layersSlice"
import {
  selectSelectedEffect,
  restoreDefaults,
  randomizeValues,
} from "./effectsSlice"
import EffectEditor from "./EffectEditor"
import EffectList from "./EffectList"
import EffectLayer from "./EffectLayer"
import NewEffect from "./NewEffect"
import CopyEffect from "./CopyEffect"

const EffectManager = () => {
  const dispatch = useDispatch()
  const selectedLayer = useSelector(selectSelectedLayer)
  const selectedEffect = useSelector(selectSelectedEffect)
  const effects = useSelector((state) =>
    selectLayerEffects(state, selectedLayer.id),
  )
  const model = selectedEffect && new EffectLayer(selectedEffect.type).model
  const numEffects = effects.length
  const [showNewEffect, setShowNewEffect] = useState(false)
  const [showCopyEffect, setShowCopyEffect] = useState(false)

  const toggleNewEffectModal = () => setShowNewEffect(!showNewEffect)
  const toggleCopyModal = () => setShowCopyEffect(!showCopyEffect)

  const handleEffectDeleted = (id) => {
    dispatch(
      deleteEffect({
        id: selectedLayer.id,
        effectId: selectedEffect.id,
      }),
    )
  }

  const handleRestoreDefaults = () => {
    dispatch(restoreDefaults(selectedEffect.id))
  }

  const handleRandomizeValues = () => {
    dispatch(randomizeValues(selectedEffect.id))
  }

  return (
    <div>
      <NewEffect
        showModal={showNewEffect}
        toggleModal={toggleNewEffectModal}
      />
      <CopyEffect
        showModal={showCopyEffect}
        toggleModal={toggleCopyModal}
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
          defaultActiveKey={1}
          className="mt-3"
        >
          <Accordion.Item eventKey={1}>
            <Accordion.Header className="d-flex">Effects</Accordion.Header>
            <Accordion.Body>
              <EffectList
                effects={effects}
                selectedLayer={selectedLayer}
              />
              <div className="d-flex align-items-center border-start border-end border-bottom">
                <Tooltip id="tooltip-new-effect" />
                <Button
                  className="ms-2 layer-button"
                  variant="light"
                  size="sm"
                  data-tooltip-content="Create new effect"
                  data-tooltip-id="tooltip-new-layer"
                  onClick={toggleNewEffectModal}
                >
                  <FaPlusSquare />
                </Button>
                <div className="ml-auto">
                  <Tooltip id="tooltip-delete-effect" />
                  <Button
                    className="layer-button"
                    variant="light"
                    data-tooltip-content="Delete effect"
                    data-tooltip-id="tooltip-delete-layer"
                    onClick={handleEffectDeleted}
                  >
                    <FaTrash />
                  </Button>
                  <Tooltip id="tooltip-copy-effect" />
                  <Button
                    className="layer-button"
                    variant="light"
                    data-tip="Copy effect"
                    data-tooltip-content="Copy effect"
                    data-tooltip-id="tooltip-copy-layer"
                    onClick={toggleCopyModal}
                  >
                    <FaCopy />
                  </Button>
                  <Tooltip id="tooltip-restore-effect" />
                  <Button
                    className="layer-button"
                    variant="light"
                    data-tooltip-content="Restore effect defaulta"
                    data-tooltip-id="tooltip-restore-effect"
                    onClick={handleRestoreDefaults}
                  >
                    <MdOutlineSettingsBackupRestore />
                  </Button>
                  <Tooltip id="tooltip-randomize-effect" />
                  {model.randomizable && (
                    <Button
                      className="layer-button"
                      variant="light"
                      data-tooltip-content="Randomize effect values"
                      data-tooltip-id="tooltip-randomize-effect"
                      onClick={handleRandomizeValues}
                    >
                      <FaDiceFive />
                    </Button>
                  )}
                </div>
              </div>
              <EffectEditor />
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      )}
    </div>
  )
}

export default React.memo(EffectManager)
