import React from "react"
import { useSelector, useDispatch } from "react-redux"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import Form from "react-bootstrap/Form"
import ToggleButton from "react-bootstrap/ToggleButton"
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup"
import InputOption from "@/components/InputOption"
import CheckboxOption from "@/components/CheckboxOption"
import { selectMachine } from "@/features/machine/machineSlice"
import { updateMachine, setMachineRectOrigin } from "./machineSlice"
import { machineOptions } from "./Machine"

const RectSettings = () => {
  const dispatch = useDispatch()
  const { minX, maxX, minY, maxY, rectOrigin, minimizeMoves } =
    useSelector(selectMachine)

  const handleChange = (attrs) => {
    dispatch(updateMachine(attrs))
  }

  const handleOriginChange = (value) => {
    dispatch(setMachineRectOrigin(value))
  }

  return (
    <div>
      <InputOption
        onChange={handleChange}
        options={machineOptions}
        key="minX"
        optionKey="minX"
        index={0}
        data={{ minX }}
      />

      <InputOption
        onChange={handleChange}
        options={machineOptions}
        key="maxX"
        optionKey="maxX"
        index={0}
        data={{ maxX }}
      />

      <InputOption
        onChange={handleChange}
        options={machineOptions}
        key="minY"
        optionKey="minY"
        index={0}
        data={{ minY }}
      />

      <InputOption
        onChange={handleChange}
        options={machineOptions}
        key="maxY"
        optionKey="maxY"
        index={0}
        data={{ maxY }}
      />

      <Row className="align-items-center pb-2">
        <Col sm={5}>
          <Form.Label htmlFor="origin">Force origin</Form.Label>
        </Col>

        <Col sm={7}>
          <ToggleButtonGroup
            id="origin-bar"
            type="checkbox"
            name="origin"
            className="flex-wrap border"
            value={rectOrigin}
            onChange={handleOriginChange}
          >
            <ToggleButton
              variant="light"
              value={1}
              id="origin-upper-left"
            >
              upper left
            </ToggleButton>
            <ToggleButton
              variant="light"
              value={2}
              id="origin-upper-right"
            >
              upper right
            </ToggleButton>
            <ToggleButton
              variant="light"
              value={0}
              id="origin-lower-left"
            >
              lower left
            </ToggleButton>
            <ToggleButton
              variant="light"
              value={3}
              id="origin-lower-right"
            >
              lower right
            </ToggleButton>
          </ToggleButtonGroup>
        </Col>
      </Row>

      <CheckboxOption
        onChange={handleChange}
        options={machineOptions}
        optionKey="minimizeMoves"
        key="minimizeMoves"
        index={0}
        data={{ minimizeMoves }}
      />
    </div>
  )
}

export default RectSettings
