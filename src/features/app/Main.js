import React from "react"
import Tab from "react-bootstrap/Tab"
import Footer from "./Footer"
import PreviewManager from "@/features/preview/PreviewManager"

const Main = () => {
  return (
    <Tab.Container
      defaultActiveKey="preview"
    >
      <Tab.Content>
        <Tab.Pane
          eventKey="preview"
          title="Layers"
        >
          <PreviewManager />
        </Tab.Pane>

        <Tab.Pane
          eventKey="about"
          title="About"
          className="full-page-tab"
        >
          <Footer />
        </Tab.Pane>
      </Tab.Content>
    </Tab.Container>
  )
}

export default React.memo(Main)
