import React, { Component } from 'react'
import {
  Col,
  Form,
  Row
} from 'react-bootstrap'
import debounce from 'lodash/debounce'
import './option.css'

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
    const canvasId = option.canvasId || 'preview-image'
    const canvasVisible = option.canvasVisible === undefined ? true : option.canvasVisible

    return (<div>
      <Row className={"align-items-center pb-1 " + (visible ? null : ' d-none')}>
        <Col sm={5}>
        <Form.Label htmlFor="options-image">
          {option.title}
        </Form.Label>
        </Col>

        <Col sm={7}>
          <Form.Control
            id="options-image"
            type={optionType}
            accept=".png"
            onChange={(event) => {
              let attrs = {}
              let file = event.target.files[0]    // get the loaded file
              let fr = new FileReader()           // prepare the file reader to load the image to an url
              let im = new Image()                // image object to write to canvas
              let canvas = document.getElementById(canvasId)  // get the canvas element
              let context = this                  // save it for the callback
              let value =  "" + Math.random()     // need to change the value of the option in order to update the shape 
              
              fr.onload = function(){             // filereader callback
                im.onload = function(){           // image loaded callback
                  let ctx = canvas.getContext('2d')
                  canvas.height = 150
                  let scale = Math.min(canvas.width/im.width, canvas.height/im.height)
                  let xoffset = (canvas.width-im.width*scale)/2
                  let yoffset = (canvas.height-im.height*scale)/2
                  
                  ctx.drawImage(im, xoffset, yoffset, im.width*scale, im.height*scale)
                  
                  // need to set the state from the image handling callback otherwise the dataurl will be wrong
                  // set the canvas as visible
                  context.props.options[context.props.optionKey].canvasVisible = true

                  attrs[context.props.optionKey] = value
                  if (option.onChange !== undefined) {
                    attrs = option.onChange(attrs, model)
                  }
                  context.props.onChange(attrs)
                  if (context.props.delayKey !== undefined) {
                    context.delayedSet(value, context.props.delayKey, context.props.onChange)
                  }
                }
                im.src = fr.result    // set the image from url
              };
              fr.readAsDataURL(file)
            }}
            />
        </Col>
      </Row>
          <Row className={"align-items-center pb-1 " + (canvasVisible && visible ? null : ' d-none')}>
              <Col sm={7} className={"canvas-option"}> 
                <canvas id={canvasId} height="0"></canvas>
              </Col>
          </Row>
      </div>
    )
  }
}

export default ImageOption