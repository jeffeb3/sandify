import React from "react"
import { useSelector } from "react-redux"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import { selectVerticesStats } from "@/features/layers/layersSlice"

const PreviewStats = () => {
  const verticesStats = useSelector(selectVerticesStats)

  return (
    <Row className="align-items-center mx-2 mt-4">
      <Col sm={3}>Points</Col>
      <Col sm={9}>{verticesStats.numPoints}</Col>
      <Col sm={3}>Distance</Col>
      <Col sm={9}>{verticesStats.distance}</Col>
    </Row>
  )
}

export default React.memo(PreviewStats)
