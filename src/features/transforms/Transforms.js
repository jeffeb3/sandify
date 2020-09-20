import { connect } from 'react-redux'
import React, { Component } from 'react'
import {
  Accordion,
  Card,
  Row,
  Col,
  Form,
  ToggleButton,
  ToggleButtonGroup
} from 'react-bootstrap'
import InputOption from '../../components/InputOption'
import CheckboxOption from '../../components/CheckboxOption'
import DropdownOption from '../../components/DropdownOption'
import { updateLayer, toggleRepeat } from '../layers/layersSlice'
import { getCurrentLayer } from '../layers/selectors'
import Transform from '../../models/Transform'
import ScaleTransform from './ScaleTransform'
import RotationTransform from './RotationTransform'
import TrackTransform from './TrackTransform'

const mapStateToProps = (state, ownProps) => {
  const layer = getCurrentLayer(state)

  return {
    layer: layer,
    active: layer.repeatEnabled,
    options: (new Transform()).getOptions()
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const { id } = ownProps

  return {
    onChange: (attrs) => {
      attrs.id = id
      dispatch(updateLayer(attrs))
    },
    onRepeat: () => {
      dispatch(toggleRepeat({id: id}))
    },
    ontransformMethodChange: (value) => {
      dispatch(updateLayer({ transformMethod: value, id: id}))
    }
  }
}

class Transforms extends Component {
  render() {
    const activeClassName = this.props.active ? 'active' : ''
    const activeKey = this.props.active ? 1 : null

    return (
      <div className="transforms">
        <InputOption
          onChange={this.props.onChange}
          options={this.props.options}
          key="startingWidth"
          optionKey="startingWidth"
          index={0}
          model={this.props.layer} />

        <InputOption
          onChange={this.props.onChange}
          options={this.props.options}
          key="startingHeight"
          optionKey="startingHeight"
          index={0}
          model={this.props.layer} />

        <InputOption
          onChange={this.props.onChange}
          options={this.props.options}
          key="offsetX"
          optionKey="offsetX"
          index={0}
          model={this.props.layer} />

        <InputOption
          onChange={this.props.onChange}
          options={this.props.options}
          key="offsetY"
          optionKey="offsetY"
          index={0}
          model={this.props.layer} />

         <InputOption
          onChange={this.props.onChange}
          options={this.props.options}
          key="rotation"
          optionKey="rotation"
          index={0}
          model={this.props.layer} />

         <CheckboxOption
          onChange={this.props.onChange}
          options={this.props.options}
          key="reverse"
          optionKey="reverse"
          index={0}
          model={this.props.layer} />

        {this.props.layer.canTransform && <Accordion className="mt-3" defaultActiveKey={activeKey} activeKey={activeKey}>
          <Card className={activeClassName}>
            <Accordion.Toggle as={Card.Header} eventKey={1} onClick={this.props.onRepeat}>
              <h3>Loop and transform</h3>
              Draws the shape multiple times, transforming it each time.
            </Accordion.Toggle>

            <Accordion.Collapse eventKey={1}>
              <Card.Body>
                <InputOption
                  onChange={this.props.onChange}
                  options={this.props.options}
                  key="numLoops"
                  optionKey="numLoops"
                  index={0}
                  model={this.props.layer} />

                  <Row className="align-items-center pb-2">
                    <Col sm={5}>
                      <Form.Label htmlFor="transformMethod">
                        When transforming shape
                      </Form.Label>
                    </Col>

                    <Col sm={7}>
                      <ToggleButtonGroup id="transformMethod" type="radio" name="transformMethod" value={this.props.layer.transformMethod} onChange={this.props.ontransformMethodChange}>
                        <ToggleButton variant="light" value="smear">smear</ToggleButton>
                        <ToggleButton variant="light" value="intact">keep intact</ToggleButton>
                      </ToggleButtonGroup>
                    </Col>
                  </Row>

                  <Accordion className="mt-3">
                    <ScaleTransform id={this.props.layer.id} />
                    <RotationTransform id={this.props.layer.id} />
                    <TrackTransform id={this.props.layer.id} />
                  </Accordion>
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        </Accordion>
      }

      <Card className="mt-3">
        <Card.Body>
          <h3 className="mb-3">Fine tuning (advanced)</h3>
          <DropdownOption
            onChange={this.props.onChange}
            options={this.props.options}
            optionKey="connectionMethod"
            key="connectionMethod"
            index={0}
            model={this.props.layer} />

          <InputOption
            onChange={this.props.onChange}
            options={this.props.options}
            key="drawPortionPct"
            optionKey="drawPortionPct"
            min={0}
            max={100}
            index={0}
            model={this.props.layer} />

          <InputOption
            onChange={this.props.onChange}
            options={this.props.options}
            key="backtrackPct"
            optionKey="backtrackPct"
            min={0}
            max={100}
            index={0}
            model={this.props.layer} />

          <InputOption
            onChange={this.props.onChange}
            options={this.props.options}
            key="rotateStartingPct"
            optionKey="rotateStartingPct"
            min={0}
            max={100}
            index={0}
            model={this.props.layer} />
        </Card.Body>
      </Card>
    </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Transforms)
