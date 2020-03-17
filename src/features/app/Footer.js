import React, { Component } from 'react'
import {
  Col,
  Container,
  Row
} from 'react-bootstrap'

class Footer extends Component {
  render () {
    return (
      <footer className="py-5">
        <Container fluid>
          <Row className="mx-3">
            <Col xs={3}>
              <h3>About</h3>
              <p>
                Sandify is working on a solution to turn your
                cold, empty hearted, emotionless sand tables into
                cold, empty hearted emotionless sand table robots with enchanting patterns.
              </p>
              <p>
                Sandify is a labor of love, but if you'd like to support me financially,
                I do have a <a href="https://github.com/sponsors/jeffeb3">Donation system set up <b>with github matching donations</b></a>. Or just <a href="https://www.paypal.me/jeffeb3">PayPal</a>.
              </p>
            </Col>

            <Col xs={3}>
              <h3>Sand Machine</h3>
              <p>
                Anything that uses gcode can be used with sandify.
                But the machine this was designed for is the ZenXY from V1Engineering.com:
                <br />
                <a href="https://docs.v1engineering.com/zenxy/">ZenXY on V1Engineering.com</a>
                <br />
                <a href="https://www.thingiverse.com/thing:2477901">ZenXY Thingiverse Page</a>
              </p>
              <p>
                ZenXY was inspired by the awesome Sisyphus Kinetic Art Table by <a href="https://sisyphus-industries.com/">Sisyphus Industries</a>, which is also now supported.
              </p>
              <p>
                Sandify was created by users in the
                <a href="https://forum.v1engineering.com/t/does-this-count-as-a-build/6037"> V1Engineering.com Forum</a>
              </p>
            </Col>

            <Col xs={3}>
              <h3>Github</h3>
              Sandify is hosted on github.io
              <p>
                <a href="https://github.com/jeffeb3/sandify">Sandify Source Code</a>
              </p>
              <p>
                Please post any problems, feature requests or comments in the github issues:
                <br />
                <a href="https://github.com/jeffeb3/sandify/issues">Sandify Issue Tracker</a>
              </p>
              <p>
                Sandify is a community project. We want and need developers:
                <br />
                <a href="https://github.com/jeffeb3/sandify/wiki#developer-info">Help Sandify</a>
              </p>
            </Col>

            <Col xs={3}>
              <h3>License</h3>
              <p>
                Sandify is licensed under the MIT license.
              </p>
              <p>
                Patterns that you create and gcode generated with sandify are not covered
                under the sandify license (they are your work, and are your copyright).
                <br />
                <a href="https://raw.githubusercontent.com/jeffeb3/sandify/master/LICENSE">Sandify License</a>
              </p>
            </Col>
          </Row>
        </Container>
      </footer>
    );
  }
}

export default Footer
