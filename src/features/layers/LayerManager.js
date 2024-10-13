import React, { useState, useEffect } from "react"
import Button from "react-bootstrap/Button"
import { Tooltip } from "react-tooltip"
import { useSelector, useDispatch } from "react-redux"
import { FaTrash, FaCopy, FaPlusSquare, FaDiceFive } from "react-icons/fa"
import { MdOutlineSettingsBackupRestore } from "react-icons/md"
import LayerEditor from "@/features/layers/LayerEditor"
import {
  selectSelectedLayerId,
  selectNumLayers,
  restoreDefaults,
  randomizeValues,
} from "@/features/layers/layersSlice"
import { deleteLayer } from "@/features/layers/layersSlice"
import NewLayer from "./NewLayer"
import CopyLayer from "./CopyLayer"
import LayerList from "./LayerList"
import "./LayerManager.scss"

const LayerManager = () => {
  const dispatch = useDispatch()
  const selectedLayerId = useSelector(selectSelectedLayerId)
  const numLayers = useSelector(selectNumLayers)
  const canRemove = numLayers > 1

  const [showNewLayer, setShowNewLayer] = useState(false)
  const [showCopyLayer, setShowCopyLayer] = useState(false)

  const toggleNewLayerModal = () => setShowNewLayer(!showNewLayer)
  const toggleCopyModal = () => setShowCopyLayer(!showCopyLayer)
  const handleLayerRemoved = (id) => dispatch(deleteLayer(selectedLayerId))

  useEffect(() => {
    const el = document.getElementById("layers")
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [numLayers])

  const handleRestoreDefaults = () => {
    dispatch(restoreDefaults(selectedLayerId))
  }

  const handleRandomizeValues = () => {
    dispatch(randomizeValues(selectedLayerId))
  }

  return (
    <div className="d-flex flex-column h-100">
      <NewLayer
        showModal={showNewLayer}
        toggleModal={toggleNewLayerModal}
      />
      <CopyLayer
        showModal={showCopyLayer}
        toggleModal={toggleCopyModal}
      />
      <div className="p-3">
        <LayerList />
        <div className="d-flex align-items-center border-start border-end border-bottom">
          <Tooltip id="tooltip-new-layer" />
          <Button
            className="ms-2 layer-button"
            variant="light"
            size="sm"
            data-tooltip-content="Create new layer"
            data-tooltip-id="tooltip-new-layer"
            onClick={toggleNewLayerModal}
          >
            <FaPlusSquare />
          </Button>
          {canRemove && <Tooltip id="tooltip-delete-layer" />}
          {canRemove && (
            <Button
              className="layer-button"
              variant="light"
              data-tooltip-content="Delete layer"
              data-tooltip-id="tooltip-delete-layer"
              onClick={handleLayerRemoved}
            >
              <FaTrash />
            </Button>
          )}
          <Tooltip id="tooltip-copy-layer" />
          <Button
            className="layer-button"
            variant="light"
            data-tooltip-content="Copy layer"
            data-tooltip-id="tooltip-copy-layer"
            onClick={toggleCopyModal}
          >
            <FaCopy />
          </Button>
          <Tooltip id="tooltip-restore-layer" />
          <Button
            className="layer-button"
            variant="light"
            data-tooltip-content="Restore layer defaults"
            data-tooltip-id="tooltip-restore-layer"
            onClick={handleRestoreDefaults}
          >
            <MdOutlineSettingsBackupRestore />
          </Button>
          <Tooltip id="tooltip-randomize-layer" />
          <Button
            className="layer-button"
            variant="light"
            data-tooltip-content="Randomize values"
            data-tooltip-id="tooltip-randomize-layer"
            onClick={handleRandomizeValues}
          >
            <FaDiceFive />
          </Button>
        </div>
      </div>
      <LayerEditor />
    </div>
  )
}

export default React.memo(LayerManager)
