import { connect } from 'react-redux'
import React, { Component } from 'react'
import {
  Accordion,
  Card
} from 'react-bootstrap'
import CheckboxOption from '../../components/CheckboxOption'
import InputOption from '../../components/InputOption'
import {
  toggleSpin,
  updateTransform,
} from './transformsSlice'
import { getCurrentTransformSelector } from '../shapes/selectors'
import Transform from '../../models/Transform'

const mapStateToProps = (state, ownProps) => {
  const transform = getCurrentTransformSelector(state)

  return {
    transform: transform,
    active: transform.spinEnabled,
    options: (new Transform()).getOptions()
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const { id } = ownProps

  return {
    onChange: (attrs) => {
      attrs.id = id
      dispatch(updateTransform(attrs))
    },
    onSpin: () => {
      dispatch(toggleSpin({id: id}))
    },
  }
}

class RotationTransform extends Component {
  render() {
    const activeClassName = this.props.active ? 'active' : ''
    const activeKey = this.props.active ? 0 : null

    return (
      <Accordion defaultActiveKey={activeKey} activeKey={activeKey}>
        <Card className={`${activeClassName} overflow-auto`}>
          <Accordion.Toggle as={Card.Header} eventKey={0} onClick={this.props.onSpin}>
            <h3>Spin</h3>
            Spins the shape
          </Accordion.Toggle>

          <Accordion.Collapse eventKey={0}>
            <Card.Body>

              <InputOption
                onChange={this.props.onChange}
                options={this.props.options}
                key="spinValue"
                optionKey="spinValue"
                index={0}
                model={this.props.transform} />

              <CheckboxOption
                onChange={this.props.onChange}
                options={this.props.options}
                optionKey="spinAdvanced"
                key="spinAdvanced"
                index={0}
                model={this.props.transform} />

              <InputOption
                onChange={this.props.onChange}
                options={this.props.options}
                key="spinMath"
                optionKey="spinMath"
                index={1}
                model={this.props.transform} />

              <InputOption
                onChange={this.props.onChange}
                options={this.props.options}
                key="spinSwitchbacks"
                optionKey="spinSwitchbacks"
                index={0}
                model={this.props.transform} />
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RotationTransform)
