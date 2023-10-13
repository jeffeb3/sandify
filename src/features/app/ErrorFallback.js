import React from "react"
import Container from "react-bootstrap/Container"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Button from "react-bootstrap/Button"
import Alert from "react-bootstrap/Alert"
import { RiEmotionUnhappyLine } from "react-icons/ri"
import { useDispatch } from "react-redux"

const ErrorFallback = ({ error }) => {
  const dispatch = useDispatch()

  const handleResetPattern = () => {
    dispatch({ type: "RESET_PATTERN" })
    window.location.reload()
  }

  const handleResetAll = () => {
    dispatch({ type: "RESET_ALL" })
    window.location.reload()
  }

  return (
    <Container
      fluid
      className="text-center"
    >
      <Row>
        <Col
          xs={{ span: 12, offset: 0 }}
          lg={{ span: 6, offset: 3 }}
          className="mt-5"
          role="alert"
        >
          <RiEmotionUnhappyLine size={96} />
          <h1 className="mt-3 mb-4">Sorry! Something went wrong.</h1>
          <Alert variant="danger">
            <pre className="mb-0 text-wrap">{error.message}</pre>
          </Alert>
          <Container
            className="mt-5"
            fluid
          >
            <Row>
              <Col
                xs={5}
                sm={4}
                className="d-flex align-items-start"
              >
                <Button
                  variant="warning"
                  className="flex-grow-1 flex-shrink-0"
                  onClick={handleResetPattern}
                >
                  Reset pattern
                </Button>
              </Col>
              <Col
                xs={7}
                sm={8}
              >
                <p className="text-start ms-3">
                  First try resetting your pattern. If you are getting this
                  error while trying to open a saved pattern, there is likely
                  something wrong with the file.
                </p>
              </Col>
              <Col
                xs={5}
                sm={4}
                className="d-flex align-items-start"
              >
                <Button
                  variant="danger"
                  className="flex-grow-1 flex-shrink-0"
                  onClick={handleResetAll}
                >
                  Reset all
                </Button>
              </Col>
              <Col
                xs={7}
                sm={8}
              >
                <p className="text-start ms-3">
                  As a last resort, you can reset all settings. If you think
                  you&apos;ve found an issue with Sandify, please let us know on{" "}
                  <a href="https://github.com/jeffeb3/sandify/issues">GitHub</a>
                  .
                </p>
              </Col>
            </Row>
          </Container>
        </Col>
      </Row>
    </Container>
  )
}

export default ErrorFallback
