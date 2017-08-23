import React, { Component } from 'react';
import {
    Tab,
    Tabs,
} from 'react-bootstrap'
import './InputTabs.css'
import Turtle from './Turtle.js'
import Transforms from './Transforms.js'
import Wiper from './Wiper.js'
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
         <Tab eventKey={0} title="Transforms">
           <Transforms/>
         </Tab>
         <Tab eventKey={1} title="Turtle">
           <Turtle/>
         </Tab>
         <Tab eventKey={2} title="Wiper">
           <Wiper/>
         </Tab>
       </Tabs>
    );
  }
}
InputTabs = connect()(InputTabs);

export default InputTabs;
