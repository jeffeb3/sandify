import React, { Component } from 'react'
import {
    ListGroup,
    Panel,
} from 'react-bootstrap'
import RectSettings from './RectSettings.js'
import PolarSettings from './PolarSettings.js'
import './MachineSettings.css'

class MachineSettings extends Component {
  render() {
    return (
      <div className="machine-form">
        <Panel className="machine-panel">
          <h4>Machine Settings</h4>
          <ListGroup>
            <RectSettings/>
            <PolarSettings/>
          </ListGroup>
        </Panel>
      </div>
    )
  }
}

export default MachineSettings;
