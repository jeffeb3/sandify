import React, { Component } from 'react'
import ReactGA from 'react-ga'
import { Tab, Tabs } from 'react-bootstrap'
import { connect } from 'react-redux'
import Uploader from '../importer/Uploader'
import MachineSettings from '../machine/MachineSettings'
import Footer from './Footer'
import Layer from '../layers/Layer'
import Playlist from '../layers/Playlist'
import { chooseInput } from '../app/appSlice'
import { getCurrentLayer } from '../layers/selectors'

const mapStateToProps = (state, ownProps) => {
  const layer = getCurrentLayer(state)

  return {
    layer: layer
  }
}

class InputTabs extends Component {
  handleSelect(key) {
    ReactGA.event({
      category: 'InputTabs',
      action: 'handleSelect: ' + key,
    })
    this.props.dispatch(chooseInput(key))
  }

  render() {
    return (
       <Tabs defaultActiveKey="shape" onSelect={this.handleSelect.bind(this)} id="input-tabs">
         <Tab eventKey="shape" title="Draw" className="full-page-tab d-flex">
           <div className="d-flex flex-column flex-grow-1">
             <Playlist />
             <Layer key={this.props.layer.id} id={this.props.layer.id} />
            </div>
         </Tab>

         <Tab eventKey="machine" title="Machine" className="full-page-tab">
           <MachineSettings />
         </Tab>

         <Tab eventKey="code" title="Import" className="full-page-tab">
           <Uploader />
         </Tab>

         <Tab eventKey="about" title="About" className="full-page-tab">
           <Footer />
         </Tab>
       </Tabs>
    )
  }
}

export default connect(mapStateToProps, null)(InputTabs)
