import React, { Component } from "react"
import { Col, Row } from "react-bootstrap"
import { Provider } from "react-redux"
import Header from "./Header"
import InputTabs from "./InputTabs"
import Preview from "@/features/preview/Preview"
import store from "./store"
import "./App.scss"

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <div className="App">
          <Header />

          <main>
            <Row className="no-gutters">
              <Col className="full-page d-flex flex-column">
                <Preview />
              </Col>

              <div id="sidebar">
                <InputTabs />
              </div>
            </Row>
          </main>
        </div>
      </Provider>
    )
  }
}

export default App
