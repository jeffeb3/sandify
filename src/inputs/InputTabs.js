import React, { Component } from 'react';
import {
    Tab,
    Tabs,
} from 'react-bootstrap'
import './InputTabs.css'
import Transforms from './Transforms.js'
import Wiper from './Wiper.js'
import ThetaRho from './ThetaRho.js'
import { connect } from 'react-redux'
import {
  chooseInput,
} from '../reducers/Index.js';

class InputTabs extends Component {

  handleSelect( key ) {
    this.props.dispatch(chooseInput(key));
  }

  render() {
    return (
       <Tabs defaultActiveKey={0} onSelect={this.handleSelect.bind(this)} id="inputTabs">
         <Tab eventKey={0} title="Shapes">
           <Transforms/>
         </Tab>
         <Tab eventKey={2} title="Wiper">
           <Wiper/>
         </Tab>
         <Tab eventKey={3} title="Code">
           <ThetaRho/>
         </Tab>
       </Tabs>
    );
  }
}
InputTabs = connect()(InputTabs);

export default InputTabs;
