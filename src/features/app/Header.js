import React, { Component } from 'react'
import logo from './logo.svg'
import './Header.scss'

class Header extends Component {
  render() {
    return (
      <header>
        <div className="d-flex align-items-center justify-content-center">
          <img src={logo} className="app-logo mr-2" alt="logo" />
          <h1 className="d-inline m-0">sandify</h1>
          <p className="ml-4 d-none d-lg-block">create patterns for robots that draw in sand with ball bearings</p>
        </div>
      </header>
    )
  }
}

export default Header
