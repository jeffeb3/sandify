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
  updateLayer
} from '../layers/layersSlice'
import { getCurrentLayer } from '../layers/selectors'
import Transform from '../../models/Transform'

const mapStateToProps = (state, ownProps) => {
  const layer = getCurrentLayer(state)

  return {
    layer: layer,
    active: layer.trackEnabled,
    activeGrow: layer.trackGrowEnabled,
    options: new Transform().getOptions()
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const { id } = ownProps

  return {
    onChange: (attrs) => {
      attrs.id = id
      dispatch(updateLayer(attrs))
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
    const activeKey = this.props.active ? 1 : null
    const activeGrowClassName = this.props.activeGrow ? 'active' : ''
    const activeGrowKey = this.props.activeGrow ? 1 : null

    return (
      <Accordion defaultActiveKey={activeKey} activeKey={activeKey}>
        <Card className={activeClassName}>
          <Accordion.Toggle as={Card.Header} eventKey={1} onClick={this.props.onTrack}>
            <h3>Track</h3>
            Moves the shape along a track (shown in green)
          </Accordion.Toggle>

          <Accordion.Collapse eventKey={1}>
            <Card.Body>
              <InputOption
                onChange={this.props.onChange}
                options={this.props.options}
                key="trackValue"
                optionKey="trackValue"
                index={0}
                model={this.props.layer} />

              <InputOption
                onChange={this.props.onChange}
                options={this.props.options}
                key="trackLength"
                optionKey="trackLength"
                index={0}
                step={0.05}
                model={this.props.layer} />

              <InputOption
                onChange={this.props.onChange}
                options={this.props.options}
                key="trackNumLoops"
                optionKey="trackNumLoops"
                index={0}
                model={this.props.layer} />

              <InputOption
                onChange={this.props.onChange}
                options={this.props.options}
                key="trackMathXInput"
                optionKey="trackMathXInput"
                index={0}
                model={this.props.layer} />

              <InputOption
                onChange={this.props.onChange}
                options={this.props.options}
                key="trackMathYInput"
                optionKey="trackMathYInput"
                index={0}
                model={this.props.layer} />

              <Accordion defaultActiveKey={activeGrowKey} className="mt-3">
                <Card className={activeGrowClassName}>
                  <Accordion.Toggle as={Card.Header} eventKey={1} onClick={this.props.onTrackGrow}>
                    <h3>Scale track</h3>
                    Grows or shrinks the track
                  </Accordion.Toggle>

                  <Accordion.Collapse eventKey={1}>
                    <Card.Body>
                      <InputOption
                        onChange={this.props.onChange}
                        options={this.props.options}
                        key="trackGrow"
                        optionKey="trackGrow"
                        index={0}
                        model={this.props.layer} />
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
