import { connect } from 'react-redux'
import React, { Component } from 'react'
import {
  Accordion,
  Card
} from 'react-bootstrap'
import InputOption from '../../components/InputOption'
import DropdownOption from '../../components/DropdownOption'
import {
  updateTransform,
  toggleRepeat
} from './transformsSlice'
import { getCurrentTransformSelector } from '../shapes/selectors'
import Transform from '../../shapes/Transform'
import ScaleTransform from './ScaleTransform'
import RotationTransform from './RotationTransform'
import TrackTransform from './TrackTransform'

const mapStateToProps = (state, ownProps) => {
  const transform = getCurrentTransformSelector(state)

  return {
    transform: transform,
    active: transform.repeatEnabled,
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
    onRepeat: () => {
      dispatch(toggleRepeat({id: id}))
    },
  }
}

class Transforms extends Component {
  render() {
    const activeClassName = this.props.active ? 'active' : ''
    const activeKey = this.props.active ? 0 : null

    return (
      <div className="transforms">
        <InputOption
          onChange={this.props.onChange}
          options={this.props.options}
          key="offsetX"
          optionKey="offsetX"
          index={0}
          model={this.props.transform} />

        <InputOption
          onChange={this.props.onChange}
          options={this.props.options}
          key="offsetY"
          optionKey="offsetY"
          index={0}
          model={this.props.transform} />

        <Accordion className="mt-3" defaultActiveKey={activeKey} activeKey={activeKey}>
          <Card className={activeClassName}>
            <Accordion.Toggle as={Card.Header} eventKey={0} onClick={this.props.onRepeat}>
              <h3>Loop and transform</h3>
              Draws the shape multiple times, transforming it each time.
            </Accordion.Toggle>

            <Accordion.Collapse eventKey={0}>
              <Card.Body>
                <InputOption
                  onChange={this.props.onChange}
                  options={this.props.options}
                  key="numLoops"
                  optionKey="numLoops"
                  index={0}
                  model={this.props.transform} />

                  <DropdownOption
                    onChange={this.props.onChange}
                    options={this.props.options}
                    key="transformFrequency"
                    optionKey="transformFrequency"
                    index={0}
                    model={this.props.transform} />

                  <Accordion className="mt-3">
                    <ScaleTransform id={this.props.transform.id} />
                    <RotationTransform id={this.props.transform.id} />
                    <TrackTransform id={this.props.transform.id} />
                  </Accordion>
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        </Accordion>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Transforms)
