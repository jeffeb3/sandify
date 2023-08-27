import React from "react"
import { useDispatch, useSelector } from "react-redux"
import Accordion from "react-bootstrap/Accordion"
import RectSettings from "./RectSettings"
import PolarSettings from "./PolarSettings"
import { selectMachine } from "@/features/machine/machineSlice"
import {
  toggleMachinePolarExpanded,
  toggleMachineRectExpanded,
} from "./machineSlice"

const MachineSettings = () => {
  const dispatch = useDispatch()
  const machine = useSelector(selectMachine)
  const rectangular = machine.rectangular

  const handleRectMachineToggle = () => {
    dispatch(toggleMachineRectExpanded())
  }

  const handlePolarMachineToggle = () => {
    dispatch(toggleMachinePolarExpanded())
  }

  return (
    <div className="p-3">
      <Accordion defaultActiveKey={rectangular ? 1 : 2}>
        <Accordion.Item eventKey={1}>
          <Accordion.Header onClick={handleRectMachineToggle}>
            <div>
              <h3>Rectangular machine</h3>
              <div className="mt-1">Rectangular machines like Zen XY</div>
            </div>
          </Accordion.Header>
          <Accordion.Body>
            <RectSettings />
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey={2}>
          <Accordion.Header onClick={handlePolarMachineToggle}>
            <div>
              <h3>Polar machine</h3>
              <div className="mt-1">Polar machines like Sisyphus</div>
            </div>
          </Accordion.Header>
          <Accordion.Body>
            <PolarSettings />
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  )
}

export default MachineSettings
