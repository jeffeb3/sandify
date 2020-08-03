import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    Accordion
} from 'react-bootstrap'
import RectSettings from './RectSettings'
import PolarSettings from './PolarSettings'

const mapStateToProps = (state, ownProps) => {
  return {
    rectangular: state.machine.rectangular,
  }
}

class MachineSettings extends Component {
  render() {
    return (
      <div className="p-3">
        <Accordion defaultActiveKey={this.props.rectangular ? 2 : 1}>
          <RectSettings />
          <PolarSettings />
        </Accordion>
      </div>
    )
  }
}

export default connect(mapStateToProps, null)(MachineSettings)
