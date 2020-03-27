import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Card } from 'react-bootstrap'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import MachineSettings from './MachineSettings'
import PreviewWindow from './PreviewWindow'
import { setMachineSlider } from './machineSlice'
import { getVerticesStats } from './selectors'
import './MachinePreview.css'

const mapStateToProps = (state, ownProps) => {
  return {
    sliderValue: state.machine.sliderValue,
    verticesStats: getVerticesStats(state),
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
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

          <div className="m-2">
            Points: {this.props.verticesStats.numPoints}, Distance: {this.props.verticesStats.distance}
          </div>

          <div className="p-3">
              <Slider
                value={this.props.sliderValue}
                step={1.0}
                min={0.0}
                max={100.0}
                onChange={this.props.onSlider}
              />
          </div>
        </Card>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MachinePreview)
