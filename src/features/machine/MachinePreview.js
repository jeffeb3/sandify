import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Panel } from 'react-bootstrap'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import { getVerticesStats } from '../common/Computer.js';
import MachineSettings from './MachineSettings';
import PreviewWindow from './PreviewWindow';
import { setMachineSlider } from './machineSlice'
import './MachinePreview.css';

const mapState = (state, ownProps) => {
  return {
    sliderValue: state.machine.sliderValue,
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

        <Panel>
            <PreviewWindow />
            Points: {this.props.verticesStats.numPoints}, Distance: {this.props.verticesStats.distance}
            <div className="slide-box">
                <Slider
                  value={this.props.sliderValue}
                  step={1.0}
                  min={0.0}
                  max={100.0}
                  onChange={this.props.onSlider}
                />
            </div>
            <div className="cheatBox" id="biggerBox">
                <MachineSettings />
            </div>
        </Panel>
      </div>
    )
  }
}

export default connect(mapState, mapDispatch)(MachinePreview)
