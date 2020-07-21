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
              let attrs = {}
              let value = event.target.files[0]   // get the loaded file
              let fr = new FileReader()
              let im = new Image()
              let canvas = document.getElementById("preview-canvas")  // get the preview element
              let context = this                  // save it for the callback
              
              fr.onload = function(){             // filereader callback
                im.onload = function(){           // image loaded callback
                  let ctx = canvas.getContext('2d')
                  canvas.height = 150
                  let scale = Math.min(canvas.width/im.width, canvas.height/im.height)
                  ctx.drawImage(im, 0, 0, im.width*scale, im.height*scale)
                  
                  // need to set the state from the callback otherwise the dataurl will be wrong
                  attrs[context.props.optionKey] = value
                  if (option.onChange !== undefined) {
                    attrs = option.onChange(attrs, model)
                  }
                  context.props.onChange(attrs)
                  if (context.props.delayKey !== undefined) {
                    context.delayedSet(value, context.props.delayKey, context.props.onChange)
                  }
                }
                value = fr.result       // need to save the value as a serialized object
                im.src = value          // use the value for the preview
              };
              fr.readAsDataURL(value)
            }}
            />
        </Col>
      </Row>
      <Row className={"align-items-center pb-1 " + (visible ? null : ' d-none')}>
          <Col sm={5}>
          </Col>
          <Col sm={7}> 
            <canvas id="preview-canvas" height="0"></canvas>
          </Col>
      </Row>
      </div>
    )
  }
}

export default ImageOption
