import React from "react"
import { useSelector, useDispatch } from "react-redux"
import {
  Accordion,
  Card,
  Col,
  Form,
  Row,
  ToggleButton,
  ToggleButtonGroup,
} from "react-bootstrap"
import InputOption from "@/components/InputOption"
import CheckboxOption from "@/components/CheckboxOption"
import { getMachineState } from "@/features/machine/machineSelectors"
import {
  updateMachine,
  toggleMachineRectExpanded,
  setMachineRectOrigin,
} from "./machineSlice"
import { machineOptions } from "./options"

const RectSettings = () => {
  const dispatch = useDispatch()
  const { rectangular, minX, maxX, minY, maxY, origin, minimizeMoves } =
    useSelector(getMachineState)
  const activeClassName = rectangular ? "active" : ""

  const handleAccordionToggle = () => {
    dispatch(toggleMachineRectExpanded())
  }

  const handleChange = (attrs) => {
    dispatch(updateMachine(attrs))
  }

  const handleOriginChange = (value) => {
    dispatch(setMachineRectOrigin(value))
  }

  return (
    <Card className={`${activeClassName} overflow-auto`}>
      <Accordion.Toggle
        as={Card.Header}
        eventKey={2}
        onClick={handleAccordionToggle}
      >
        <h3>Rectangular machine</h3>
        Rectangular machines like Zen XY
      </Accordion.Toggle>

      <Accordion.Collapse eventKey={2}>
        <Card.Body>
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
                value={origin}
                onChange={handleOriginChange}
              >
                <ToggleButton
                  variant="light"
                  value={1}
                >
                  upper left
                </ToggleButton>
                <ToggleButton
                  variant="light"
                  value={2}
                >
                  upper right
                </ToggleButton>
                <ToggleButton
                  variant="light"
                  value={0}
                >
                  lower left
                </ToggleButton>
                <ToggleButton
                  variant="light"
                  value={3}
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
        </Card.Body>
      </Accordion.Collapse>
    </Card>
  )
}

export default RectSettings
