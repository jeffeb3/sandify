import React from "react"
import { useDispatch, useSelector } from "react-redux"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import Select from "react-select"
import ModelOption from "@/components/ModelOption"
import {
  updateMachine,
  selectCurrentMachine,
  changeMachineType,
} from "./machinesSlice"
import { getMachine, getMachineSelectOptions } from "./machineFactory"
import { useTranslation } from "react-i18next"

const MachineEditor = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const machine = useSelector(selectCurrentMachine)
  const type = machine?.type || "rectangular" // guard zombie child
  const instance = getMachine(type)
  const machineOptions = instance.getOptions()
  const selectOptions = getMachineSelectOptions()
  const selectedOption = {
    value: instance.type,
    label: instance.label,
  }

  const handleChange = (attrs) => {
    attrs.id = machine.id
    dispatch(updateMachine(attrs))
  }

  const handleChangeType = (selected) => {
    dispatch(changeMachineType({ id: machine.id, type: selected.value }))
  }

  const renderedMachineSelection = (
    <Row className="align-items-center">
      <Col
        sm={5}
        className="mb-1"
      >
        {t("machine.type")}
      </Col>

      <Col
        sm={7}
        className="mb-1"
      >
        <Select
          value={selectedOption}
          onChange={handleChangeType}
          maxMenuHeight={305}
          options={selectOptions}
          menuPortalTarget={document.body}
          styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
        />
      </Col>
    </Row>
  )

  // this should really be a component, but I could not figure out how to get it
  // to not re-render as the value changed; the fallout is that the editor re-renders
  // more than it should, but it's not noticeable
  const renderOption = ({ optionKey }) => {
    return (
      <ModelOption
        model={instance}
        key={optionKey}
        data={machine}
        options={machineOptions}
        optionKey={optionKey}
        onChange={handleChange}
      />
    )
  }

  const renderedModelOptions = Object.keys(machineOptions)
    .filter(
      (optionKey) => optionKey !== "name" && optionKey !== "minimizeMoves",
    )
    .map((optionKey) => renderOption({ options: machineOptions, optionKey }))

  return (
    <div className="flex-grow-1 mx-3 mt-3">
      {renderOption({ optionKey: "name" })}
      {renderedMachineSelection}
      {renderedModelOptions}
      {renderOption({ optionKey: "minimizeMoves" })}
    </div>
  )
}

export default React.memo(MachineEditor)
