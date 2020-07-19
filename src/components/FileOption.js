import React, { Component } from 'react'
import {
  Col,
  Form,
  Row
} from 'react-bootstrap'
import debounce from 'lodash/debounce'

class ImageOption extends Component {
  constructor(props) {
    super(props);
    this.delayedSet = debounce( (value, key, onChange) => {
      let attrs = {}
      attrs[key] = value
      onChange(attrs)
    }, 1500)
  }

  render() {
    const option = this.props.options[this.props.optionKey]
    const model = this.props.model
    const optionType = option.type || 'file'
    const visible = option.isVisible === undefined ? true : option.isVisible(model)

    return (<div>
      <Row className={"align-items-center pb-1 " + (visible ? null : ' d-none')}>
        <Col sm={5}>
        <Form.Label htmlFor="options-step">
          {option.title}
        </Form.Label>
        </Col>

        <Col sm={7}>
          <Form.Control
            id="options-step"
            type={optionType}
            accept=".png"
            onChange={(event) => {
                console.log("Prova")
              let attrs = {}
              let value = event.target.files[0]
              let fr = new FileReader()
              let im = new Image(value)
              let canvas = document.getElementById("prova")
              
              fr.onload = function(){
                im.onload = function(){
                    let ctx = canvas.getContext('2d')
                    ctx.drawImage(im, 0, 0)
                }
                im.src = fr.result
              };
              fr.readAsDataURL(value)
              value = canvas.toDataURL()    // need a serialized object

              attrs[this.props.optionKey] = value
              if (option.onChange !== undefined) {
                attrs = option.onChange(attrs, model)
              }
              this.props.onChange(attrs)
              if (this.props.delayKey !== undefined) {
                this.delayedSet(value, this.props.delayKey, this.props.onChange)
              }
            }}
            />
        </Col>
      </Row>
      <Row className={"align-items-center pb-1 " + (visible ? null : ' d-none')}>
          <Col sm={5}>
            <canvas id="prova"></canvas>
          </Col>
      </Row>
      </div>
    )
  }
}

export default ImageOption
