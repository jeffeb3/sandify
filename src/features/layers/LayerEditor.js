import React, { Component } from "react"
import { connect } from "react-redux"
import { Button, Card, Row, Col, Accordion } from "react-bootstrap"
import Select from "react-select"
import { IconContext } from "react-icons"
import { AiOutlineRotateRight } from "react-icons/ai"
import CommentsBox from "@/components/CommentsBox"
import InputOption from "@/components/InputOption"
import DropdownOption from "@/components/DropdownOption"
import CheckboxOption from "@/components/CheckboxOption"
import ToggleButtonOption from "@/components/ToggleButtonOption"
import { getCurrentLayerState } from "./selectors"
import { getModelSelectOptions } from "@/config/models"
import { updateLayer, changeModelType, restoreDefaults } from "./layersSlice"
import Layer from "./Layer"
import "./LayerEditor.scss"

const mapStateToProps = (state, ownProps) => {
  return {
    state: getCurrentLayerState(state),
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const { id } = ownProps

  return {
    onChange: (attrs) => {
      attrs.id = id
      dispatch(updateLayer(attrs))
    },
    onChangeType: (selected) => {
      dispatch(changeModelType({ id, type: selected.value }))
    },
    onRestoreDefaults: (event) => {
      dispatch(restoreDefaults(id))
    },
  }
}

class LayerEditor extends Component {
  render() {
    const { state } = this.props
    const layer = new Layer(state.type)
    const model = layer.model
    const layerOptions = layer.getOptions()
    const modelOptions = model.getOptions()
    const selectOptions = getModelSelectOptions()
    const allowModelSelection = model.selectGroup !== "import" && !model.effect

    const selectedOption = {
      value: model.type,
      label: model.label,
    }
    const link = model.link
    const linkText = model.linkText || link
    const renderedModelOptions = Object.keys(modelOptions).map((key) => {
      return (
        <div
          className="mt-1"
          key={key}
        >
          {this.getOptionComponent(model, modelOptions, key)}
        </div>
      )
    })

    const renderedLink = link ? (
      <Row>
        <Col sm={5}></Col>
        <Col sm={7}>
          <p className="mt-2">
            See{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={link}
            >
              {linkText}
            </a>{" "}
            for ideas.
          </p>
        </Col>
      </Row>
    ) : undefined
    const renderedModelSelection = allowModelSelection && (
      <Row className="align-items-center">
        <Col sm={5}>Type</Col>

        <Col sm={7}>
          <Select
            value={selectedOption}
            onChange={this.props.onChangeType}
            maxMenuHeight={305}
            options={selectOptions}
          />
        </Col>
      </Row>
    )

    return (
      <Card
        className="p-3 overflow-auto flex-grow-1"
        style={{ borderTop: "1px solid #aaa", borderBottom: "none" }}
      >
        <Accordion
          key={1}
          defaultActiveKey={1}
        >
          <Card>
            <Card.Header>
              <Accordion.Toggle
                as={Button}
                variant="link"
                eventKey={1}
              >
                Layer
              </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey={1}>
              <Card.Body>
                {this.getOptionComponent(model, layerOptions, "name")}
                {model.canTransform(state) && (
                  <Row className="align-items-center">
                    <Col sm={5}>Transform</Col>
                    <Col sm={7}>
                      {model.canMove && (
                        <Row>
                          <Col xs={6}>
                            {this.getOptionComponent(model, layerOptions, "x")}
                          </Col>
                          <Col xs={6}>
                            {this.getOptionComponent(model, layerOptions, "y")}
                          </Col>
                        </Row>
                      )}
                      {model.canChangeSize(state) && model.autosize && (
                        <Row className="mt-1">
                          <Col xs={6}>
                            {this.getOptionComponent(
                              model,
                              layerOptions,
                              "width",
                            )}
                          </Col>
                          <Col xs={6}>
                            {this.getOptionComponent(
                              model,
                              layerOptions,
                              "height",
                            )}
                          </Col>
                        </Row>
                      )}
                      {model.canRotate(state) && (
                        <Row className="mt-1">
                          <Col xs={6}>
                            <div className="d-flex align-items-center">
                              <div className="mr-1">
                                <IconContext.Provider
                                  value={{ size: "1.3rem" }}
                                >
                                  <AiOutlineRotateRight />
                                </IconContext.Provider>
                              </div>
                              {this.getOptionComponent(
                                model,
                                layerOptions,
                                "rotation",
                                false,
                              )}
                            </div>
                          </Col>
                        </Row>
                      )}
                    </Col>
                  </Row>
                )}
                {this.getOptionComponent(model, layerOptions, "reverse")}
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        </Accordion>

        <Accordion
          key={2}
          defaultActiveKey={2}
          className="mt-3"
        >
          <Card>
            <Card.Header className="d-flex">
              <Accordion.Toggle
                as={Button}
                variant="link"
                eventKey={1}
              >
                Shape
              </Accordion.Toggle>
              <Button
                className="ml-auto"
                variant="outline-primary"
                size="sm"
                onClick={this.props.onRestoreDefaults}
              >
                Restore defaults
              </Button>
            </Card.Header>
            <Accordion.Collapse eventKey={2}>
              <Card.Body>
                {renderedModelSelection}
                {renderedModelOptions}
                {renderedLink}
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        </Accordion>
      </Card>
    )
  }

  getOptionComponent(model, options, key, label = true) {
    const option = options[key]
    const { state, onChange } = this.props
    const props = {
      options,
      label,
      key,
      onChange,
      optionKey: key,
      data: state,
      object: model,
      comments: state.comments,
    }

    switch (option.type) {
      case "dropdown":
        return <DropdownOption {...props} />
      case "checkbox":
        return <CheckboxOption {...props} />
      case "comments":
        return <CommentsBox {...props} />
      case "togglebutton":
        return <ToggleButtonOption {...props} />
      default:
        return <InputOption {...props} />
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LayerEditor)
