import React, { Component } from 'react'
import {
    Tab,
    Tabs,
} from 'react-bootstrap'
import { connect } from 'react-redux'
import Transforms from '../transforms/Transforms.js'
import Wiper from '../wiper/Wiper.js'
import ThetaRho from '../theta_rho/ThetaRho.js'
import { chooseInput} from '../app/appSlice.js'

class InputTabs extends Component {
  handleSelect(key) {
    this.props.dispatch(chooseInput(key))
  }

  render() {
    return (
       <Tabs defaultActiveKey="shapes" onSelect={this.handleSelect.bind(this)} id="input-tabs">
         <Tab eventKey="shapes" title="Shapes">
           <Transforms />
         </Tab>

         <Tab eventKey="wiper" title="Wiper">
           <Wiper />
         </Tab>

         <Tab eventKey="code" title="Code">
           <ThetaRho />
         </Tab>
       </Tabs>
    )
  }
}

export default connect()(InputTabs)
