import React from "react"
import { createRoot } from "react-dom/client"
import "./features/app/reactGA"
import App from "./features/app/App"
import "./index.css"

const root = createRoot(document.getElementById("root"))
root.render(<App />)
