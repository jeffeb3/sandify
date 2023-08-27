import React from "react"
import Col from "react-bootstrap/Col"
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
          <div className="d-flex flex-column flex-lg-row">
            <Col className="full-page d-flex flex-column">
              <PreviewManager />
            </Col>

            <div id="sidebar">
              <Tabs />
            </div>
          </div>
        </main>
      </div>
    </Provider>
  )
}

export default App
