import React, { Component } from 'react'
import {
    Tab,
    Tabs,
} from 'react-bootstrap'
import { connect } from 'react-redux'
import ShapeList from '../shapes/ShapeList'
import Wiper from '../wiper/Wiper'
import ThetaRho from '../theta_rho/ThetaRho'
import { chooseInput } from '../app/appSlice'

class InputTabs extends Component {
  handleSelect(key) {
    this.props.dispatch(chooseInput(key))
  }

  render() {
    return (
       <Tabs defaultActiveKey="shapes" onSelect={this.handleSelect.bind(this)} id="input-tabs">
         <Tab eventKey="shapes" title="Shapes">
           <ShapeList />
         </Tab>

         <Tab eventKey="wiper" title="Wiper">
           <Wiper />
         </Tab>

         <Tab eventKey="code" title="Import">
           <ThetaRho />
         </Tab>
       </Tabs>
    )
  }
}

export default connect()(InputTabs)
