import React, { Component } from 'react'
import logo from './logo.svg'
import './Header.scss'

class Header extends Component {
  render() {
    return (
      <header>
        <div className="d-flex align-items-center justify-content-center">
          <img src={logo} className="app-logo mr-2" alt="logo" />
          <h2 className="d-inline m-0">sandify</h2>
        </div>
        <p>create patterns for robots that draw in sand with ball bearings</p>
      </header>
    );
  }
}

export default Header
