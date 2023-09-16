import React from "react"
import { useSelector } from "react-redux"
import Container from "react-bootstrap/Container"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import HappyHolidays from "./happy-holidays.svg"
import PerlinRings from "./perlin-rings.svg"
import KochCubeFlowers from "./koch-cube-flowers.svg"
import { selectAppVersion } from "@/features/app/appSlice"
import "./About.scss"

const About = () => {
  const version = useSelector(selectAppVersion)

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
            <div
              style={{ fontSize: "1.4rem" }}
              className="mb-2"
            >
              v{version}
            </div>
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
              something you like. Check out the{" "}
              <a href="https://github.com/jeffeb3/sandify/wiki">wiki</a> for
              some features that you might miss the first time through.
            </p>
            <h2>Exporting patterns</h2>
            <h3 className="mt-3">What sand machines are supported?</h3>
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
            <h2>Importing layers</h2>
            Sandify supports import of pattern files as new layers. Supported
            formats are .thr, .gcode, and .nc files.
            <h3 className="mt-3">Where can I find theta rho files?</h3>
            Sisyphus machines use theta rho (.thr) files. There is a large
            community sharing patterns.
            <div className="row mt-2">
              <div className="col-6">
                <ul className="list-unstyled">
                  <li>
                    <a href="https://reddit.com/u/markyland">
                      Markyland on Reddit
                    </a>
                  </li>
                  <li>
                    <a href="https://github.com/Dithermaster/sisyphus/">
                      Dithermaster&apos;s github
                    </a>
                  </li>
                  <li>
                    <a href="https://github.com/SlightlyLoony/JSisyphus">
                      JSisyphus by Slightly Loony
                    </a>
                  </li>
                </ul>
              </div>
              <div className="col-6">
                <ul className="list-unstyled">
                  <li>
                    <a href="https://reddit.com/r/SisyphusIndustries">
                      Sisyphus on Reddit
                    </a>
                  </li>
                  <li>
                    <a href="https://sisyphus-industries.com/community/community-tracks">
                      Sisyphus Community
                    </a>
                  </li>
                  <li>
                    <a href="http://thejuggler.net/sisyphus/">The Juggler</a>
                  </li>
                </ul>
              </div>
            </div>
            <h3 className="mt-2">About copyrights</h3>
            <p>
              Be careful and respectful regarding pattern copyrights. Understand
              that the original author put their labor, intensity, and ideas
              into this art. The creators have a right to own it (and they have
              a copyright, even if it doesn&apos;t say so). If you don&apos;t
              have permission (a license) to use their art, then you
              shouldn&apos;t be. If you do have permission to use their art,
              then you should be thankful, and I&apos;m sure they would
              appreciate you sending them a note of thanks. A picture of your
              table creating their shared art would probably make them smile.
            </p>
            <p>
              Someone posting the .thr file to a forum or subreddit probably
              wants it to be shared, and drawing it on your home table is
              probably OK. Just be careful if you want to use them for something
              significant without explicit permission.
            </p>
            <p>P.S. I am not a lawyer.</p>
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
