import React, { useState } from "react"
import Tab from "react-bootstrap/Tab"
import { Provider } from "react-redux"
import { ToastContainer } from "react-toastify"
import { ErrorBoundary } from "react-error-boundary"
import PreviewManager from "@/features/preview/PreviewManager"
import Header from "./Header"
import About from "./About"
import Sidebar from "./Sidebar"
import store from "./store"
import ErrorFallback from "./ErrorFallback"
import "./App.scss"

const App = () => {
  const [eventKey, setEventKey] = useState("patterns")

  return (
    <Provider store={store}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <div className="App">
          <ToastContainer
            position="top-center"
            autoClose={5000}
            hideProgressBar={true}
            theme="colored"
          />
          <Header
            eventKey={eventKey}
            setEventKey={setEventKey}
          />
          <main>
            <Tab.Container
              activeKey={eventKey}
              defaultActiveKey="about"
            >
              <Tab.Content>
                <Tab.Pane eventKey="patterns">
                  <div className="d-flex flex-column flex-lg-row">
                    <div className="full-page d-flex flex-column flex-grow-1">
                      <PreviewManager />
                    </div>
                    <div
                      id="sidebar"
                      className="flex-shrink-0"
                    >
                      <Sidebar />
                    </div>
                  </div>
                </Tab.Pane>

                <Tab.Pane
                  eventKey="about"
                  className="full-page-tab"
                >
                  <About />
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </main>
        </div>
      </ErrorBoundary>
    </Provider>
  )
}

export default App
