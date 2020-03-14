import React, { Component } from 'react';
import {
    Tab,
    Tabs,
} from 'react-bootstrap'
import { connect } from 'react-redux'
import Transforms from '../transforms/Transforms.js'
import Wiper from '../wiper/Wiper.js'
import ThetaRho from '../theta_rho/ThetaRho.js'
import { chooseInput} from '../app/appSlice.js'
import './InputTabs.css'

class InputTabs extends Component {
  handleSelect( key ) {
    this.props.dispatch(chooseInput(key));
  }

  render() {
    return (
       <Tabs defaultActiveKey={0} onSelect={this.handleSelect.bind(this)} id="inputTabs">
         <Tab eventKey={0} title="Shapes">
           <Transforms />
         </Tab>
         <Tab eventKey={2} title="Wiper">
           <Wiper />
         </Tab>
         <Tab eventKey={3} title="Code">
           <ThetaRho />
         </Tab>
       </Tabs>
    );
  }
}

export default connect()(InputTabs)
