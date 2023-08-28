import React, { useState } from "react"
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/NavDropdown'
import Downloader from "@/features/exporter/Downloader"
import logo from "./logo.svg"
import "./Header.scss"

const Header = () => {
  const [showExport, setShowExport] = useState(false)
  const toggleShowExport = () => setShowExport(!showExport)

  return (
    <Navbar expand="lg" className="header px-3">
      <Navbar.Brand href="/">
        <div className="d-flex align-items-center">
          <img
            src={logo}
            className="app-logo me-2"
            alt="logo"
          />
          <h1 className="d-inline m-0 me-3">sandify</h1>
        </div>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <NavDropdown title="File" id="basic-nav-dropdown">
            <NavDropdown.Item onClick={toggleShowExport}>
              Export
            </NavDropdown.Item>
          </NavDropdown>
          <Nav.Link>About</Nav.Link>
        </Nav>
      </Navbar.Collapse>
      <Downloader
        showModal={showExport}
        toggleModal={toggleShowExport}
      />
    </Navbar>
  )
}

export default Header
