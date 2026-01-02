import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import Tab from "react-bootstrap/Tab"
import { Provider } from "react-redux"
import { ToastContainer } from "react-toastify"
import { ErrorBoundary } from "react-error-boundary"
import PreviewManager from "@/features/preview/PreviewManager"
import Header from "./Header"
import About from "./About"
import Settings from "./Settings"
import Sidebar from "./Sidebar"
import store from "./store"
import ErrorFallback from "./ErrorFallback"
import "./App.scss"

const AppContent = () => {
  const { i18n } = useTranslation()
  const [eventKey, setEventKey] = useState("patterns")

  return (
    <div
      className="App"
      key={i18n.language}
    >
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
          defaultActiveKey="patterns"
        >
          <Tab.Content>
            <Tab.Pane eventKey="patterns">
              <div className="d-flex flex-column flex-lg-row">
                <div className="full-page d-flex flex-column flex-grow-1">
                  <PreviewManager isActive={eventKey === "patterns"} />
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

            <Tab.Pane
              eventKey="settings"
              className="full-page-tab"
            >
              <Settings />
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </main>
    </div>
  )
}

const App = () => {
  return (
    <Provider store={store}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <AppContent />
      </ErrorBoundary>
    </Provider>
  )
}

export default App
