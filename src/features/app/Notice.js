import React, { Component } from 'react'
import './Notice.scss'

class Notice extends Component {
  render() {
    return (
      <div className="notice d-flex align-items-center justify-content-center">
        <p className="ml-4 d-none d-lg-block">
            <a href="https://sisyphus.wishpondpages.com/track-design-contest-algorithmic-entry/">Use Sandify to enter the Sisyphus design competition! Enter by Oct 16th.</a>
        </p>
      </div>
    )
  }
}

export default Notice
