import React from "react"
import { Col, Row } from "react-bootstrap"
import { Provider } from "react-redux"
import Header from "./Header"
import Tabs from "./Tabs"
import PreviewManager from "@/features/preview/PreviewManager"
import store from "./store"
import "./App.scss"

const App = () => {
  return (
    <Provider store={store}>
      <div className="App">
        <Header />

        <main>
          <Row className="no-gutters">
            <Col className="full-page d-flex flex-column">
              <PreviewManager />
            </Col>

            <div id="sidebar">
              <Tabs />
            </div>
          </Row>
        </main>
      </div>
    </Provider>
  )
}

export default App
