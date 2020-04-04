import React, { Component } from 'react'
import { connect } from 'react-redux'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import PreviewWindow from './PreviewWindow'
import GCodeGenerator from '../gcode/GCodeGenerator'
import { setMachineSlider } from './machineSlice'
import { getVerticesStats } from './selectors'
import './MachinePreview.scss'

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
      <div className="machine-preview d-flex flex-grow-1 flex-column" id="machine-preview">
        <div className="flex-grow-1 d-flex flex-column">
          <div id="preview-wrapper" className="preview-wrapper overflow-hidden d-flex align-items-center">
            <PreviewWindow />
          </div>

          <div className="mt-auto pt-2 bg-white d-flex align-items-center">
            <div className="flex-grow-1">
              <div className="mx-2">
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
            </div>
            <GCodeGenerator />
          </div>
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MachinePreview)
