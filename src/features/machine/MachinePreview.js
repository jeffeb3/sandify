import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Card } from 'react-bootstrap'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import { getVerticesStats } from '../../common/Computer.js'
import MachineSettings from './MachineSettings'
import PreviewWindow from './PreviewWindow'
import { setMachineSlider } from './machineSlice'
import './MachinePreview.css'

const mapState = (state, ownProps) => {
  return {
    slider_value: state.machine.slider_value,
    verticesStats: getVerticesStats(state),
  }
}

const mapDispatch = (dispatch, ownProps) => {
  return {
    onSlider: (value) => {
      dispatch(setMachineSlider(value))
    },
  }
}

class MachinePreview extends Component {
  render() {
    return (
      <div className="machine-preview">
        <Card>
            <PreviewWindow />

            <div class="m-2">
              Points: {this.props.verticesStats.numPoints}, Distance: {this.props.verticesStats.distance}
            </div>

            <div className="p-3">
                <Slider
                  value={this.props.slider_value}
                  step={1.0}
                  min={0.0}
                  max={100.0}
                  onChange={this.props.onSlider}
                />
            </div>

            <MachineSettings />
        </Card>
      </div>
    )
  }
}

export default connect(mapState, mapDispatch)(MachinePreview)
