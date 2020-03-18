import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    Accordion
} from 'react-bootstrap'
import RectSettings from './RectSettings.js'
import PolarSettings from './PolarSettings.js'
import GCodeGenerator from '../gcode/GCodeGenerator'

const mapState = (state, ownProps) => {
  return {
    rectangular: state.machine.rectangular,
  }
}

class MachineSettings extends Component {
  render() {
    return (
      <div id="bigger-box" className="p-3">
        <h4>Machine Settings</h4>

        <Accordion defaultActiveKey={this.props.rectangular ? 0 : 1}>
          <RectSettings />
          <PolarSettings />
        </Accordion>

        <GCodeGenerator />
      </div>
    )
  }
}

export default connect(mapState, null)(MachineSettings)
