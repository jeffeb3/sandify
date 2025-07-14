import React, { useState } from "react"
import { useDispatch } from "react-redux"
import Nav from "react-bootstrap/Nav"
import Navbar from "react-bootstrap/Navbar"
import NavDropdown from "react-bootstrap/NavDropdown"
import ExportDownloader from "@/features/export/ExportDownloader"
import ImageUploader from "@/features/import/ImageUploader"
import LayerUploader from "@/features/import/LayerUploader"
import SandifyDownloader from "@/features/file/SandifyDownloader"
import SandifyUploader from "@/features/file/SandifyUploader"
import logo from "./logo.svg"
import "./Header.scss"

const Header = ({ eventKey, setEventKey }) => {
  const [showExport, setShowExport] = useState(false)
  const [showImportLayer, setShowImportLayer] = useState(0)
  const [showImportImage, setShowImportImage] = useState(0)
  const [showSave, setShowSave] = useState(false)
  const [showOpen, setShowOpen] = useState(0)
  const toggleExport = () => setShowExport(!showExport)
  const toggleImportLayer = () => setShowImportLayer(showImportLayer + 1)
  const toggleImportImage = () => setShowImportImage(showImportImage + 1)
  const toggleSave = () => setShowSave(!showSave)
  const toggleOpen = () => setShowOpen(showOpen + 1)
  const dispatch = useDispatch()

  const handleNew = () => {
    dispatch({ type: "RESET_PATTERN" })
  }

  return (
    <Navbar
      expand="lg"
      className="header px-3"
    >
      <Navbar.Brand href="/">
        <div className="d-flex align-items-center">
          <h1>
            <img
              src={logo}
              className="app-logo me-2"
              alt="sandify"
            />
          </h1>
        </div>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <NavDropdown
            title="File"
            id="file-dropdown"
          >
            <NavDropdown.Item onClick={handleNew}>New</NavDropdown.Item>
            <NavDropdown.Item onClick={toggleOpen}>Open...</NavDropdown.Item>
            <NavDropdown.Item onClick={toggleSave}>Save as...</NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={toggleImportImage}>
              Import image...
            </NavDropdown.Item>
            <NavDropdown.Item onClick={toggleImportLayer}>
              Import layer...
            </NavDropdown.Item>
            <NavDropdown.Item onClick={toggleExport}>
              Export pattern as...
            </NavDropdown.Item>
          </NavDropdown>
          <Nav.Link
            active={eventKey === "patterns"}
            onClick={() => setEventKey("patterns")}
          >
            Patterns
          </Nav.Link>
          <Nav.Link
            active={eventKey === "about"}
            onClick={() => setEventKey("about")}
          >
            About
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
      <ExportDownloader
        showModal={showExport}
        toggleModal={toggleExport}
      />
      <ImageUploader
        showModal={showImportImage}
        toggleModal={toggleImportImage}
      />
      <LayerUploader
        showModal={showImportLayer}
        toggleModal={toggleImportLayer}
      />
      <SandifyUploader
        showModal={showOpen}
        toggleModal={toggleOpen}
      />
      <SandifyDownloader
        showModal={showSave}
        toggleModal={toggleSave}
      />
    </Navbar>
  )
}

export default Header
