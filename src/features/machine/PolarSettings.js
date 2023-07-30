import React from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  Accordion,
  Col,
  Row,
  Form,
  Card,
  ToggleButton,
  ToggleButtonGroup,
} from "react-bootstrap"
import InputOption from "@/components/InputOption"
import CheckboxOption from "@/components/CheckboxOption"
import { getMachineState } from "@/features/machine/machineSelectors"
import { machineOptions } from "./options"
import { toggleMachinePolarExpanded, updateMachine } from "./machineSlice"

const PolarSettings = () => {
  const dispatch = useDispatch()
  const { rectangular, maxRadius, startPoint, endPoint, minimizeMoves } =
    useSelector(getMachineState)

  const handleAccordionToggle = () => {
    dispatch(toggleMachinePolarExpanded())
  }

  const handleChange = (attrs) => {
    dispatch(updateMachine(attrs))
  }

  const handleStartPointChange = (value) => {
    dispatch(updateMachine({ polarStartPoint: value }))
  }

  const handleEndPointChange = (value) => {
    dispatch(updateMachine({ polarEndPoint: value }))
  }

  // ClassName logic
  const activeClassName = rectangular ? "" : "active"

  // Render method
  return (
    <Card className={`${activeClassName} overflow-auto`}>
      <Accordion.Toggle
        as={Card.Header}
        eventKey={1}
        onClick={handleAccordionToggle}
      >
        <h3>Polar machine</h3>
        Polar machines like Sisyphus
      </Accordion.Toggle>

      <Accordion.Collapse eventKey={1}>
        <Card.Body>
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
                value={startPoint}
                onChange={handleStartPointChange}
              >
                <ToggleButton
                  variant="light"
                  value="none"
                >
                  none
                </ToggleButton>
                <ToggleButton
                  variant="light"
                  value="center"
                >
                  center
                </ToggleButton>
                <ToggleButton
                  variant="light"
                  value="perimeter"
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
                value={endPoint}
                onChange={handleEndPointChange}
              >
                <ToggleButton
                  variant="light"
                  value="none"
                >
                  none
                </ToggleButton>
                <ToggleButton
                  variant="light"
                  value="center"
                >
                  center
                </ToggleButton>
                <ToggleButton
                  variant="light"
                  value="perimeter"
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
        </Card.Body>
      </Accordion.Collapse>
    </Card>
  )
}

export default PolarSettings
