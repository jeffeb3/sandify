import React, { useState, useEffect } from "react"
import Tab from "react-bootstrap/Tab"
import { Provider, useSelector } from "react-redux"
import { ToastContainer } from "react-toastify"
import { ErrorBoundary } from "react-error-boundary"
import PreviewManager from "@/features/preview/PreviewManager"
import Header from "./Header"
import About from "./About"
import Sidebar from "./Sidebar"
import store from "./store"
import ErrorFallback from "./ErrorFallback"
import "./App.scss"

// TEMP DEBUG: logs layer/effect structure on change
const DebugLayerLogger = () => {
  const layers = useSelector((state) => state.layers)
  const effects = useSelector((state) => state.effects)

  useEffect(() => {
    const summary = layers.ids.map((id, idx) => {
      const layer = layers.entities[id]
      const layerEffects = (layer.effectIds || []).map((eid) => {
        const e = effects.entities[eid]
        if (!e) return null
        if (e.type === "mask") {
          return {
            type: "mask",
            machine: e.maskMachine,
            sourceLayerId: e.maskLayerId?.slice(0, 8),
            pos: { x: e.x, y: e.y },
            size: { w: e.width, h: e.height },
          }
        }
        return { type: e.type }
      }).filter(Boolean)

      return {
        idx,
        id: id.slice(0, 8),
        name: layer.name || "(unnamed)",
        type: layer.type,
        visible: layer.visible,
        x: layer.x || 0,
        y: layer.y || 0,
        effects: layerEffects,
      }
    })

    console.log("=== LAYER DEBUG ===")
    console.table(
      summary.map((s) => ({
        "#": s.idx,
        id: s.id,
        name: s.name,
        type: s.type,
        visible: s.visible ? "Y" : "N",
        x: s.x,
        y: s.y,
      })),
    )
    summary.forEach((s) => {
      if (s.effects.length > 0) {
        console.log(`Layer ${s.idx} (${s.id}) effects:`, s.effects)
      }
    })
  }, [layers, effects])

  return null
}

const App = () => {
  const [eventKey, setEventKey] = useState("patterns")

  return (
    <Provider store={store}>
      <DebugLayerLogger />
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
              defaultActiveKey="patterns"
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
