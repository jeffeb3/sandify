import React, { Component } from 'react'
import {
    Tab,
    Tabs,
} from 'react-bootstrap'
import { connect } from 'react-redux'
import ShapeList from '../shapes/ShapeList'
import ThetaRho from '../theta_rho/ThetaRho'
import MachineSettings from '../machine/MachineSettings'
import Footer from './Footer'
import { chooseInput } from '../app/appSlice'

class InputTabs extends Component {
  handleSelect(key) {
    this.props.dispatch(chooseInput(key))
  }

  render() {
    return (
       <Tabs defaultActiveKey="shapes" onSelect={this.handleSelect.bind(this)} id="input-tabs">
         <Tab eventKey="shapes" title="Shapes" className="full-page-tab">
           <ShapeList />
         </Tab>

         <Tab eventKey="machine" title="Machine" className="full-page-tab">
           <MachineSettings />
         </Tab>

         <Tab eventKey="code" title="Import" className="full-page-tab">
           <ThetaRho />
         </Tab>

         <Tab eventKey="about" title="About" className="full-page-tab">
           <Footer />
         </Tab>
       </Tabs>
    )
  }
}

export default connect()(InputTabs)
