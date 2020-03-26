import { connect } from 'react-redux'
import React, { Component } from 'react'
import {
  Accordion,
  Card
} from 'react-bootstrap'
import InputOption from '../../components/InputOption'
import {
  toggleTrack,
  toggleTrackGrow,
  updateTransform
} from './transformsSlice'
import { getCurrentTransformSelector } from '../shapes/selectors'
import Transform from '../../shapes/Transform'

const mapStateToProps = (state, ownProps) => {
  const transform = getCurrentTransformSelector(state)

  return {
    transform: transform,
    active: transform.trackEnabled,
    activeGrow: transform.trackGrowEnabled,
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
    onTrack: () => {
      dispatch(toggleTrack({id: id}))
    },
    onTrackGrow: () => {
      dispatch(toggleTrackGrow({id: id}))
    },
  }
}

class TrackTransform extends Component {
  render() {
    const activeClassName = this.props.active ? 'active' : ''
    const activeKey = this.props.active ? 0 : null
    const activeGrowClassName = this.props.activeGrow ? 'active' : ''
    const activeGrowKey = this.props.activeGrow ? 0 : null

    return (
      <Accordion defaultActiveKey={activeKey}>
        <Card className={activeClassName}>
          <Accordion.Toggle as={Card.Header} eventKey={0} onClick={this.props.onTrack}>
            <h4>Track</h4>
            Moves the shape along a track (shown in green)
          </Accordion.Toggle>

          <Accordion.Collapse eventKey={0}>
            <Card.Body>
              <InputOption
                onChange={this.props.onChange}
                options={this.props.options}
                key="trackValue"
                optionKey="trackValue"
                index={0}
                model={this.props.transform} />

              <InputOption
                onChange={this.props.onChange}
                options={this.props.options}
                key="trackLength"
                optionKey="trackLength"
                index={0}
                step={0.05}
                model={this.props.transform} />

              <Accordion defaultActiveKey={activeGrowKey} className="mt-3">
                <Card className={activeGrowClassName}>
                  <Accordion.Toggle as={Card.Header} eventKey={0} onClick={this.props.onTrackGrow}>
                    <h4>Scale track</h4>
                    Grows or shrinks the track
                  </Accordion.Toggle>

                  <Accordion.Collapse eventKey={0}>
                    <Card.Body>
                      <InputOption
                        onChange={this.props.onChange}
                        options={this.props.options}
                        key="trackGrow"
                        optionKey="trackGrow"
                        index={0}
                        model={this.props.transform} />
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
              </Accordion>
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>
    )
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(TrackTransform)
