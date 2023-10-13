import React from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import "core-js"
import Konva from "konva"

Konva.isBrowser = false

it("renders without crashing", () => {
  const div = document.createElement("div")
  const root = createRoot(div)
  root.render(<App />)
})
