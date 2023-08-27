import React from "react"
import { useDispatch, useSelector } from "react-redux"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import Form from "react-bootstrap/Form"
import ToggleButton from "react-bootstrap/ToggleButton"
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup"
import InputOption from "@/components/InputOption"
import CheckboxOption from "@/components/CheckboxOption"
import { selectMachine } from "@/features/machine/machineSlice"
import { machineOptions } from "@/features/machine/Machine"
import { updateMachine } from "./machineSlice"

const PolarSettings = () => {
  const dispatch = useDispatch()
  const { maxRadius, polarStartPoint, polarEndPoint, minimizeMoves } =
    useSelector(selectMachine)

  const handleChange = (attrs) => {
    dispatch(updateMachine(attrs))
  }

  const handleStartPointChange = (value) => {
    dispatch(updateMachine({ polarStartPoint: value }))
  }

  const handleEndPointChange = (value) => {
    dispatch(updateMachine({ polarEndPoint: value }))
  }

  // Render method
  return (
    <div>
      <InputOption
        onChange={handleChange}
        options={machineOptions}
        key="maxRadius"
        optionKey="maxRadius"
        index={0}
        data={{ maxRadius }}
      />

      <Row className="align-items-center pb-2">
        <Col sm={5}>
          <Form.Label htmlFor="forceStart">Start point</Form.Label>
        </Col>

        <Col sm={7}>
          <ToggleButtonGroup
            id="startPoint"
            type="radio"
            name="startPoint"
            value={polarStartPoint}
            onChange={handleStartPointChange}
          >
            <ToggleButton
              variant="light"
              value="none"
              id="start-point-none"
            >
              none
            </ToggleButton>
            <ToggleButton
              variant="light"
              value="center"
              id="start-point-center"
            >
              center
            </ToggleButton>
            <ToggleButton
              variant="light"
              value="perimeter"
              id="start-point-perimeter"
            >
              perimeter
            </ToggleButton>
          </ToggleButtonGroup>
        </Col>
      </Row>

      <Row className="align-items-center pb-2">
        <Col sm={5}>
          <Form.Label htmlFor="endPoint">End point</Form.Label>
        </Col>

        <Col sm={7}>
          <ToggleButtonGroup
            id="endPoint"
            type="radio"
            name="endPoint"
            value={polarEndPoint}
            onChange={handleEndPointChange}
          >
            <ToggleButton
              variant="light"
              value="none"
              id="end-point-none"
            >
              none
            </ToggleButton>
            <ToggleButton
              variant="light"
              value="center"
              id="end-point-center"
            >
              center
            </ToggleButton>
            <ToggleButton
              variant="light"
              value="perimeter"
              id="end-point-perimeter"
            >
              perimeter
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

export default PolarSettings
