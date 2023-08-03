import React from "react"
import { useSelector } from "react-redux"
import { Accordion } from "react-bootstrap"
import RectSettings from "./RectSettings"
import PolarSettings from "./PolarSettings"
import { selectMachine } from "@/features/machine/machineSlice"

const MachineSettings = () => {
  const machine = useSelector(selectMachine)
  const rectangular = machine.rectangular

  return (
    <div className="p-3">
      <Accordion defaultActiveKey={rectangular ? 2 : 1}>
        <RectSettings />
        <PolarSettings />
      </Accordion>
    </div>
  )
}

export default MachineSettings
