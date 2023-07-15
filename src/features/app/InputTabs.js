import React, { Component } from 'react'
import ReactGA from 'react-ga'
import { Tab, Tabs } from 'react-bootstrap'
import { connect } from 'react-redux'
import MachineSettings from '../machine/MachineSettings'
import Footer from './Footer'
import LayerEditor from '../layers/LayerEditor'
import Playlist from '../layers/Playlist'
import { chooseInput } from '../app/appSlice'
import { getCurrentLayerState } from '../layers/selectors'
import { loadFont, supportedFonts } from '../fonts/fontsSlice'

const mapStateToProps = (state, ownProps) => {
  const layer = getCurrentLayerState(state)

  return {
    layer: layer
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onLoadFont: (url) => {
      dispatch(loadFont(url))
    },
    onTabSelected: (key) => {
      ReactGA.event({
        category: 'InputTabs',
        action: 'handleSelect: ' + key,
      })
      dispatch(chooseInput(key))
    }
  }
}

class InputTabs extends Component {
  render() {
    return (
       <Tabs defaultActiveKey="shape" onSelect={this.props.onTabSelected.bind(this)} id="input-tabs">
         <Tab eventKey="shape" title="Draw" className="full-page-tab">
           <div className="d-flex flex-column h-100">
             <Playlist />
             <LayerEditor key={this.props.layer.id} id={this.props.layer.id} />
            </div>
         </Tab>

         <Tab eventKey="machine" title="Machine" className="full-page-tab">
           <MachineSettings />
         </Tab>

         <Tab eventKey="about" title="About" className="full-page-tab">
           <Footer />
         </Tab>
       </Tabs>
    )
  }

  componentDidMount() {
    Object.keys(supportedFonts).forEach(url => this.props.onLoadFont(url))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InputTabs)
