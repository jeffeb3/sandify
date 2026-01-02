/* global location, document */

import React from "react"
import { createRoot } from "react-dom/client"
import "./i18n"
import "bootstrap/dist/css/bootstrap.min.css"
import "react-toastify/dist/ReactToastify.css"
import "./features/app/bootstrap-overrides.scss"
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
