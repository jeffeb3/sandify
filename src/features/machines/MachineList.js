import React from "react"
import { useDispatch, useSelector } from "react-redux"
import ListGroup from "react-bootstrap/ListGroup"
import {
  selectAllMachines,
  selectCurrentMachineId,
  setCurrentMachine,
} from "./machinesSlice"
import { getMachine } from "./machineFactory"

const MachineRow = ({ current, numLayers, machine, handleMachineSelected }) => {
  const { name, id } = machine
  const activeClass = current ? "active" : ""
  const machineModel = getMachine(machine)

  return (
    <ListGroup.Item
      className={`layer p-2 ps-3 ${activeClass}`}
      key={id}
      id={id}
    >
      <div
        className={`d-flex align-items-center me-2`}
        onClick={handleMachineSelected}
      >
        <div className="d-flex no-select flex-grow-1 align-items-center">
          <div className="flex-grow-1">{name}</div>
          <span style={{ fontSize: "80%" }}>{machineModel.label}</span>
        </div>
      </div>
    </ListGroup.Item>
  )
}

const MachineList = () => {
  const dispatch = useDispatch()
  const machines = useSelector(selectAllMachines)
  const currentMachineId = useSelector(selectCurrentMachineId)

  const handleMachineSelected = (event) => {
    const id = event.target.closest(".list-group-item").id
    dispatch(setCurrentMachine(id))
  }

  return (
    <div className="overflow-auto border">
      <ListGroup
        variant="flush"
        id="machines"
      >
        {machines.map((machine, index) => (
          <MachineRow
            id={machine.id}
            key={machine.id}
            current={currentMachineId === machine.id}
            machine={machine}
            handleMachineSelected={handleMachineSelected}
            index={index}
          />
        ))}
      </ListGroup>
    </div>
  )
}

export default React.memo(MachineList)
