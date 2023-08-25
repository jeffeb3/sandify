import React from "react"
import { createRoot } from "react-dom/client"
import "./features/app/reactGA"
import App from "./features/app/App"
import "./index.css"

if (import.meta.hot) {
  import.meta.hot.on("vite:beforeFullReload", () => {
    location.reload()
  })
}

const root = createRoot(document.getElementById("root"))
root.render(<App />)
