import React, { useState } from "react"
import Button from "react-bootstrap/Button"
import { Tooltip } from "react-tooltip"
import { FaTrash, FaCopy, FaPlusSquare } from "react-icons/fa"
import { useSelector, useDispatch } from "react-redux"
import {
  selectNumMachines,
  selectCurrentMachineId,
  deleteMachine,
} from "@/features/machines/machinesSlice"
import MachineList from "./MachineList"
import MachineEditor from "./MachineEditor"
import CopyMachine from "./CopyMachine"
import NewMachine from "./NewMachine"

const MachineManager = () => {
  const dispatch = useDispatch()
  const numMachines = useSelector(selectNumMachines)
  const currentMachineId = useSelector(selectCurrentMachineId)

  const canRemove = numMachines > 1
  const [showNewMachine, setShowNewMachine] = useState(false)
  const [showCopyMachine, setShowCopyMachine] = useState(false)

  const toggleNewMachineModal = () => setShowNewMachine(!showNewMachine)
  const toggleCopyMachineModal = () => setShowCopyMachine(!showCopyMachine)
  const handleMachineRemoved = (id) => dispatch(deleteMachine(currentMachineId))

  return (
    <div>
      <NewMachine
        showModal={showNewMachine}
        toggleModal={toggleNewMachineModal}
      />
      <CopyMachine
        showModal={showCopyMachine}
        toggleModal={toggleCopyMachineModal}
      />
      <div className="p-3">
        <MachineList />
        <div className="d-flex align-items-center border-start border-end border-bottom">
          <Tooltip id="tooltip-new-machine" />
          <Button
            className="ms-2 layer-button"
            variant="light"
            size="sm"
            data-tooltip-content="Create new machine"
            data-tooltip-id="tooltip-new-machine"
            onClick={toggleNewMachineModal}
          >
            <FaPlusSquare />
          </Button>
          {canRemove && <Tooltip id="tooltip-delete-machine" />}
          {canRemove && (
            <Button
              className="layer-button"
              variant="light"
              data-tooltip-content="Delete machine"
              data-tooltip-id="tooltip-delete-machine"
              onClick={handleMachineRemoved}
            >
              <FaTrash />
            </Button>
          )}
          <Tooltip id="tooltip-copy-machine" />
          <Button
            className="layer-button"
            variant="light"
            data-tooltip-content="Copy machine"
            data-tooltip-id="tooltip-copy-machine"
            onClick={toggleCopyMachineModal}
          >
            <FaCopy />
          </Button>
        </div>
      </div>
      <MachineEditor />
    </div>
  )
}

export default React.memo(MachineManager)
