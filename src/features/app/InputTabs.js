import React, { useEffect } from "react"
import { Tab, Tabs } from "react-bootstrap"
import { useDispatch, useSelector } from "react-redux"
import MachineSettings from "@/features/machine/MachineSettings"
import LayerEditor from "@/features/layers/LayerEditor"
import Playlist from "@/features/layers/Playlist"
import { getCurrentLayer } from "@/features/layers/layerSelectors"
import { loadFont, supportedFonts } from "@/features/fonts/fontsSlice"
import Footer from "./Footer"

const InputTabs = () => {
  const dispatch = useDispatch()
  const layer = useSelector(getCurrentLayer)

  useEffect(() => {
    Object.keys(supportedFonts).forEach((url) => dispatch(loadFont(url)))
  }, [dispatch])

  if (layer) {
    return (
      <Tabs
        defaultActiveKey="draw"
        id="input-tabs"
      >
        <Tab
          eventKey="draw"
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

export default InputTabs
