import React, { Component } from 'react';
import {
    Tab,
    Tabs,
} from 'react-bootstrap'
import './InputTabs.css'
import Turtle from './Turtle.js'
import Transforms from './Transforms.js'

class InputTabs extends Component {

  render() {
    return (
       <Tabs defaultActiveKey={1} id="inputTabs">
         <Tab eventKey={1} title="Transforms">
           <Transforms vertices={this.props.vertices} setVertices={this.props.setVertices}/>
         </Tab>
         <Tab eventKey={2} title="Turtle">
           <Turtle vertices={this.props.vertices} setVertices={this.props.setVertices}/>
         </Tab>
       </Tabs>
    );
  }
}

export default InputTabs;
