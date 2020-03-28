import React, { Component } from 'react'

class Footer extends Component {
  render () {
    return (
      <footer className="py-4 px-3">
        <div>
          <h2>About</h2>
          <p>Sandify turns your cold, empty-hearted, emotionless sand tables into cold, empty-hearted, emotionless sand table robots with enchanting patterns.</p>
          <p>
            Sandify is a labor of love, but if you'd like to support me financially,
            I do have a <a href="https://github.com/sponsors/jeffeb3">Donation system set up <b>with github matching donations</b></a>. Or just <a href="https://www.paypal.me/jeffeb3">PayPal</a>.
          </p>
        </div>

        <div>
          <h2>Sand Machine</h2>
          <p>Anything that uses gcode can be used with Sandify. But the machine this was designed for is the ZenXY from V1Engineering.com.</p>
          <p>
            <a href="https://docs.v1engineering.com/zenxy/">ZenXY on V1Engineering.com</a>
            <br />
            <a href="https://www.thingiverse.com/thing:2477901">ZenXY Thingiverse Page</a>
          </p>
          <p>
            ZenXY was inspired by the awesome Sisyphus kinetic art table by <a href="https://sisyphus-industries.com/">Sisyphus Industries</a>, which is also now supported.
          </p>
          <p>
            Sandify was created by users in the
            <a href="https://forum.v1engineering.com/t/does-this-count-as-a-build/6037"> V1Engineering.com forum</a>.
          </p>
        </div>

        <div>
          <h2>Github</h2>
          <p>Sandify is hosted on Github <a href="https://github.com/jeffeb3/sandify">here</a>. Please post any problems, feature requests or comments in our <a href="https://github.com/jeffeb3/sandify/issues">issue tracker</a>.</p>
          <p>Sandify is a community project. We want and need developers. <a href="https://github.com/jeffeb3/sandify/wiki#developer-info">Help Sandify</a>.</p>
        </div>

        <div>
          <h2>License</h2>
          <p>
            Sandify is licensed under the MIT license.
          </p>
          <p>
            Patterns that you create and gcode generated with Sandify are not covered
            under the Sandify license. They are your work and your copyright. Read our <a href="https://raw.githubusercontent.com/jeffeb3/sandify/master/LICENSE">license</a>.
          </p>
        </div>
      </footer>
    )
  }
}

export default Footer
