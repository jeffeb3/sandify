import React, { Component } from 'react'
import logo from './logo.svg'
import './Header.css'

class Header extends Component {
  render() {
    return (
      <header>
        <img src={logo} className="app-logo" alt="logo" />
        <h2>sandify</h2>
        <p>
          web based user interface to create patterns that
          could be useful for robots that draw in sand with ball bearings.
        </p>
      </header>
    );
  }
}

export default Header
