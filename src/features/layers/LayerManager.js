import React, { useState, useEffect } from "react"
import Button from "react-bootstrap/Button"
import { Tooltip } from "react-tooltip"
import { useSelector, useDispatch } from "react-redux"
import { FaTrash, FaCopy, FaPlusSquare } from "react-icons/fa"
import {
  MdOutlineFileUpload,
  MdOutlineSettingsBackupRestore,
} from "react-icons/md"
import LayerEditor from "@/features/layers/LayerEditor"
import {
  selectSelectedLayerId,
  selectNumLayers,
  restoreDefaults,
} from "@/features/layers/layersSlice"
import { deleteLayer } from "@/features/layers/layersSlice"
import NewLayer from "./NewLayer"
import CopyLayer from "./CopyLayer"
import ImportLayer from "./ImportLayer"
import LayerList from "./LayerList"
import "./LayerManager.scss"

const LayerManager = () => {
  const dispatch = useDispatch()
  const selectedLayerId = useSelector(selectSelectedLayerId)
  const numLayers = useSelector(selectNumLayers)
  const canRemove = numLayers > 1

  const [showNewLayer, setShowNewLayer] = useState(false)
  const [showImportLayer, setShowImportLayer] = useState(false)
  const [showCopyLayer, setShowCopyLayer] = useState(false)

  const toggleNewLayerModal = () => setShowNewLayer(!showNewLayer)
  const toggleImportModal = () => setShowImportLayer(!showImportLayer)
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

  return (
    <div className="d-flex flex-column h-100">
      <NewLayer
        showModal={showNewLayer}
        toggleModal={toggleNewLayerModal}
      />
      <ImportLayer
        showModal={showImportLayer}
        toggleModal={toggleImportModal}
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
          <Tooltip id="tooltip-import-layer" />
          <Button
            className="layer-button"
            variant="light"
            data-tooltip-content="Import new layer"
            data-tooltip-id="tooltip-import-layer"
            onClick={toggleImportModal}
          >
            <MdOutlineFileUpload />
          </Button>
          <div className="ml-auto">
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
              data-tooltip-content="Restore layer defaulta"
              data-tooltip-id="tooltip-restore-layer"
              onClick={handleRestoreDefaults}
            >
              <MdOutlineSettingsBackupRestore />
            </Button>
          </div>
        </div>
      </div>
      <LayerEditor />
    </div>
  )
}

export default LayerManager
