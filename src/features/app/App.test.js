import React from "react"
import ReactDOM from "react-dom"
import App from "./App"
import "core-js"
import Konva from "konva-node"

Konva.isBrowser = false

it("renders without crashing", () => {
  const div = document.createElement("div")
  ReactDOM.render(<App />, div)
})
