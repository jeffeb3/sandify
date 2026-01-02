import React from "react"
import { useTranslation } from "react-i18next"
import Container from "react-bootstrap/Container"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Form from "react-bootstrap/Form"
import { changeLanguage } from "@/i18n"

const Settings = () => {
  const { i18n, t } = useTranslation()

  const handleLanguageChange = async (e) => {
    await changeLanguage(e.target.value)
  }

  return (
    <div className="p-4">
      <Container
        fluid
        className="ms-0"
      >
        <Row>
          <Col
            xs={12}
            sm={6}
          >
            <Form.Group>
              <Form.Label>{t("Language")}</Form.Label>
              <Form.Select
                value={i18n.language}
                onChange={handleLanguageChange}
                className="w-auto"
              >
                <option value="en">English</option>
                <option value="zh">中文</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Settings
