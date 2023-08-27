import React from "react"
import logo from "./logo.svg"
import "./Header.scss"

const Header = () => {
  return (
    <header>
      <div className="d-flex align-items-center justify-content-center">
        <img
          src={logo}
          className="app-logo me-2"
          alt="logo"
        />
        <h1 className="d-inline m-0">sandify</h1>
        <p className="ms-4 d-none d-lg-block">
          create patterns for robots that draw in sand with ball bearings
        </p>
      </div>
    </header>
  )
}

export default Header
