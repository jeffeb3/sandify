import React from "react"
import Container from "react-bootstrap/Container"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import HappyHolidays from "./happy-holidays.svg"
import PerlinRings from "./perlin-rings.svg"
import KochCubeFlowers from "./koch-cube-flowers.svg"
import "./About.scss"

const About = () => {
  return (
    <footer className="p-4">
      <Container
        fluid
        className="ms-0"
      >
        <Row>
          <Col
            xs={12}
            sm={6}
          >
            <h1 className="mb-0">sandify</h1>
            <div className="tagline mb-2">
              create patterns for robots that draw in sand with ball bearings
            </div>
            <p>
              Sandify turns your cold, empty-hearted, emotionless sand tables
              into cold, empty-hearted, emotionless sand table robots with
              enchanting patterns. Sandify is a labor of love, but if you&apos;d
              like to support Sandify development financially, I do have a{" "}
              <a href="https://github.com/sponsors/jeffeb3">
                Donation system set up with github
              </a>
              . Or just <a href="https://www.paypal.me/jeffeb3">PayPal</a>.
            </p>
            <p>
              Sandify was created by users in the
              <a href="https://forum.v1engineering.com/t/does-this-count-as-a-build/6037">
                {" "}
                V1Engineering.com
              </a>{" "}
              forum.
            </p>

            <h2 className="mt-4">Getting started</h2>
            <p>
              Part of the fun of Sandify is playing it like you would a
              xylophone. Try it out first. The goal is to make it easy to make
              your first pattern by just clicking and scrolling, finding
              something you like. Check out{" "}
              <a href="https://github.com/jeffeb3/sandify/wiki">the wiki</a> for
              some features that you might miss the first time through.
            </p>

            <h2 className="mt-4">What sand machines are supported?</h2>
            <p>
              Sandify supports gcode and theta-rho formats. Sandify was
              originally designed for{" "}
              <a href="https://docs.v1engineering.com/zenxy/">
                ZenXY on V1Engineering.com
              </a>
              , which was inspired by the awesome Sisyphus kinetic art table by{" "}
              <a href="https://sisyphus-industries.com/">Sisyphus Industries</a>
              .
            </p>

            <h2 className="mt-4">Github</h2>
            <p>
              Sandify is hosted on{" "}
              <a href="https://github.com/jeffeb3/sandify">Github</a>. Please
              post any problems, feature requests or comments in our{" "}
              <a href="https://github.com/jeffeb3/sandify/issues">
                issue tracker
              </a>
              . We&apos;re a community project, so{" "}
              <a href="https://github.com/jeffeb3/sandify/blob/master/CONTRIBUTING.md">
                we&apos;d love your help.
              </a>
            </p>

            <h2 className="mt-4">License</h2>
            <p>
              Sandify is licensed under the{" "}
              <a href="https://raw.githubusercontent.com/jeffeb3/sandify/master/LICENSE">
                MIT license
              </a>
              . Patterns that you create and code generated with Sandify are not
              covered under the Sandify license. They are your work and your
              copyright.
            </p>
          </Col>
          <Col
            xs={12}
            sm={6}
          >
            <img
              src={KochCubeFlowers}
              className="pattern-preview"
            />
            <img
              src={PerlinRings}
              className="pattern-preview"
            />
            <img
              src={HappyHolidays}
              className="pattern-preview"
            />
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default About
