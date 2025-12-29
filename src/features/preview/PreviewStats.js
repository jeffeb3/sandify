import React from "react"
import { useSelector } from "react-redux"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import { selectVerticesStats } from "@/features/layers/layersSlice"
import { useTranslation } from "react-i18next"


const PreviewStats = () => {
  const verticesStats = useSelector(selectVerticesStats)
  const { t } = useTranslation()

  return (
    <Row className="align-items-center mx-2 mt-4">
      <Col sm={5}>{t("previewStats.points")}</Col>
      <Col sm={7}>{verticesStats.numPoints}</Col>
      <Col sm={5}>{t("previewStats.distance")}</Col>
      <Col sm={7}>{verticesStats.distance}</Col>
    </Row>
  )
}

export default React.memo(PreviewStats)
