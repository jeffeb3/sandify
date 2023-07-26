import React, { Component } from "react"
import ReactGA from "react-ga"
import { Tab, Tabs } from "react-bootstrap"
import { connect } from "react-redux"
import MachineSettings from "@/features/machine/MachineSettings"
import LayerEditor from "@/features/layers/LayerEditor"
import Playlist from "@/features/layers/Playlist"
import { getCurrentLayer } from "@/features/layers/selectors"
import { getFontsState } from "@/features/store/selectors"
import { loadFont, supportedFonts } from "@/features/fonts/fontsSlice"
import { chooseInput } from "./appSlice"
import Footer from "./Footer"

const mapStateToProps = (state, ownProps) => {
  const fonts = getFontsState(state)
  if (!fonts.loaded) {
    return {}
  }

  const layer = getCurrentLayer(state)

  return {
    layer,
    fontsLoaded: fonts.loaded,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onLoadFont: (url) => {
      dispatch(loadFont(url))
    },
    onTabSelected: (key) => {
      ReactGA.event({
        category: "InputTabs",
        action: "handleSelect: " + key,
      })
      dispatch(chooseInput(key))
    },
  }
}

class InputTabs extends Component {
  render() {
    const { layer, onTabSelected } = this.props

    if (layer) {
      return (
        <Tabs
          defaultActiveKey="shape"
          onSelect={onTabSelected.bind(this)}
          id="input-tabs"
        >
          <Tab
            eventKey="shape"
            title="Draw"
            className="full-page-tab"
          >
            <div className="d-flex flex-column h-100">
              <Playlist />
              <LayerEditor
                key={layer.id}
                id={layer.id}
              />
            </div>
          </Tab>

          <Tab
            eventKey="machine"
            title="Machine"
            className="full-page-tab"
          >
            <MachineSettings />
          </Tab>

          <Tab
            eventKey="about"
            title="About"
            className="full-page-tab"
          >
            <Footer />
          </Tab>
        </Tabs>
      )
    } else {
      return <div></div>
    }
  }

  componentDidMount() {
    Object.keys(supportedFonts).forEach((url) => this.props.onLoadFont(url))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InputTabs)
