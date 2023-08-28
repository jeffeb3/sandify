import React from "react"
import Col from "react-bootstrap/Col"
import Container from 'react-bootstrap/Container'
import { Provider } from "react-redux"
import Header from "./Header"
import Sidebar from "./Sidebar"
import Main from "./Main"
import store from "./store"
import logo from "./logo.svg"
import "./App.scss"

const App = () => {
  return (
    <Provider store={store}>
      <div className="App">
        <Header />
        <main>
          <div className="d-flex flex-column flex-lg-row">
            <div className="full-page d-flex flex-column flex-grow-1">
              <Main />
            </div>

            <div id="sidebar" className="flex-shrink-0">
              <Sidebar />
            </div>
          </div>
        </main>
      </div>
    </Provider>
  )
}

export default App
