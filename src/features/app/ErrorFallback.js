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

  const handleReset = () => {
    dispatch({ type: "RESET_PATTERN" })
    window.location.reload()
  }

  return (
    <Container
      fluid
      className="text-center"
    >
      <Row>
        <Col
          xs={{ span: 6, offset: 3 }}
          className="mt-5"
          role="alert"
        >
          <RiEmotionUnhappyLine size={96} />
          <h1 className="mt-3 mb-4">Sorry! Something went wrong.</h1>
          <Alert
            variant="danger"
            className="d-inline-flex"
          >
            <pre className="mb-0">{error.message}</pre>
          </Alert>
          <p className="mt-4">
            To fix this, we need to reset your pattern. If you are getting this
            error while trying to open a saved pattern, there is likely
            something wrong with the file. If you think you&apos;ve found an
            issue with Sandify, please let us know on{" "}
            <a href="https://github.com/jeffeb3/sandify/issues">Github</a>.
          </p>
          <Button
            className="mt-2"
            onClick={handleReset}
          >
            Reload
          </Button>
        </Col>
      </Row>
    </Container>
  )
}

export default ErrorFallback
