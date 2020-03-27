import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { Vertex } from '../../common/Geometry'
import { setMachineSize } from './machineSlice'
import {
  transform,
} from '../../common/Computer'
import { getVertices } from './selectors'
import { createSelector } from 'reselect'
import throttle from 'lodash/throttle'

const getTransforms = state => state.transforms

const getTrackVertices = createSelector(
  [getTransforms],
  (data) => {
    var numLoops = data.numLoops
    var trackVertices = []
    for (var i=0; i<numLoops; i++) {
      if (data.trackEnabled) {
        trackVertices.push(transform(data, {x: 0.0, y: 0.0}, i))
      }
    }
    return trackVertices
  }
)

const mapStateToProps = (state, ownProps) => {
  return {
    use_rect: state.machine.rectangular,
    minX: state.machine.minX,
    maxX: state.machine.maxX,
    minY: state.machine.minY,
    maxY: state.machine.maxY,
    maxRadius: state.machine.maxRadius,
    canvasWidth: state.machine.canvasWidth,
    canvasHeight: state.machine.canvasHeight,
    vertices: getVertices(state),
    sliderValue: state.machine.sliderValue,
    showTrack: state.app.input === 0,
    trackVertices: getTrackVertices(state),
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onResize: (size) => {
      dispatch(setMachineSize(size))
    },
  }
}

// Contains the preview window, and any parameters for the machine.
class PreviewWindow extends Component {
  componentDidMount() {
    const canvas = ReactDOM.findDOMNode(this)
    const context = canvas.getContext('2d')
    const bigBox = document.getElementById("preview-canvas")

    this.throttledResize = throttle(this.resize, 200).bind(this)

    window.addEventListener('resize', () => { this.throttledResize(canvas, bigBox) }, false)
    setTimeout(() => this.resize(canvas, bigBox), 250)
    this.paint(context)
  }

  componentDidUpdate() {
    var canvas = ReactDOM.findDOMNode(this)
    var context = canvas.getContext('2d')
    context.clearRect(0, 0, this.props.canvasWidth, this.props.canvasHeight)
    var bigBox = document.getElementById("preview-canvas")
    this.resize(canvas, bigBox)
  }

  // in mm means in units of mm, but 0,0 is the center, not the lower corner or something.
  mmToPixelsScale() {
    var machine_x = 1
    var machine_y = 1
    if (this.props.use_rect) {
      machine_x = this.props.maxX - this.props.minX
      machine_y = this.props.maxY - this.props.minY
    } else {
      machine_x = this.props.maxRadius * 2.0
      machine_y = machine_x
    }

    var scale_x = this.props.canvasWidth / machine_x
    var scale_y = this.props.canvasHeight / machine_y
    // Keep it square.
    return Math.min(scale_x, scale_y) * 0.95
  }

  mmToPixels(vertex) {
    var min_scale = this.mmToPixelsScale()

    var x = vertex.x * min_scale + this.props.canvasWidth/2.0
    // Y for pixels starts at the top, and goes down.
    var y = -vertex.y * min_scale + this.props.canvasHeight/2.0

    return Vertex(x, y)
  }

  moveTo_mm(context, vertex) {
    var in_mm = this.mmToPixels(vertex)
    context.moveTo(in_mm.x, in_mm.y)
  }

  lineTo_mm(context, vertex) {
    var in_mm = this.mmToPixels(vertex)
    context.lineTo(in_mm.x, in_mm.y)
  }

  dot_mm(context, vertex) {
    var in_mm = this.mmToPixels(vertex)
    context.arc(in_mm.x, in_mm.y, Math.max(4.0, this.mmToPixelsScale() * 1.5), 0, 2 * Math.PI, true)
    context.fillStyle = context.strokeStyle
    context.fill()
  }

  slice_vertices(vertices, sliderValue) {
    const slide_size = 10.0
    if (sliderValue === 0) {
      return vertices
    }

    // Let's start by just assuming we want a slide_size sized window, as a percentage of the whole
    // thing.
    const begin_fraction = sliderValue / 100.0
    const end_fraction = (slide_size + sliderValue) / 100.0

    const begin_vertex = Math.round(vertices.length * begin_fraction)
    const end_vertex = Math.round(vertices.length * end_fraction)

    return vertices.slice(begin_vertex, end_vertex)
  }

  paint(context) {
    context.save()

    // Draw the bounds of the machine
    context.beginPath()
    context.lineWidth = "1"
    context.strokeStyle = "lightblue"
    if (this.props.use_rect) {
      this.moveTo_mm(context, Vertex((this.props.minX - this.props.maxX)/2.0, (this.props.minY - this.props.maxY)/2.0))
      this.lineTo_mm(context, Vertex((this.props.maxX - this.props.minX)/2.0, (this.props.minY - this.props.maxY)/2.0))
      this.lineTo_mm(context, Vertex((this.props.maxX - this.props.minX)/2.0, (this.props.maxY - this.props.minY)/2.0))
      this.lineTo_mm(context, Vertex((this.props.minX - this.props.maxX)/2.0, (this.props.maxY - this.props.minY)/2.0))
      this.lineTo_mm(context, Vertex((this.props.minX - this.props.maxX)/2.0, (this.props.minY - this.props.maxY)/2.0))
    } else {
      this.moveTo_mm(context, Vertex(this.props.maxRadius, 0.0))
      let resolution = 128.0
      for (let i=0; i<=resolution; i++) {
        let angle = Math.PI * 2.0 / resolution * i
        this.lineTo_mm(context, Vertex(this.props.maxRadius * Math.cos(angle),
                                       this.props.maxRadius * Math.sin(angle)))
      }
    }
    context.stroke()

    var drawing_vertices = this.props.vertices
    drawing_vertices = this.slice_vertices(drawing_vertices, this.props.sliderValue)
    if (drawing_vertices && drawing_vertices.length > 0) {
      // Draw the start and end points
      context.beginPath()
      context.lineWidth = 1.0
      context.strokeStyle = "green"
      this.dot_mm(context, this.props.vertices[0])
      context.stroke()
      context.beginPath()
      context.lineWidth = 1.0
      context.strokeStyle = "red"
      this.dot_mm(context, this.props.vertices[this.props.vertices.length-1])
      context.stroke()

      // Draw the background vertices
      if (this.props.sliderValue !== 0) {
        context.beginPath()
        context.lineWidth = this.mmToPixelsScale()
        context.strokeStyle = "gray"
        this.moveTo_mm(context, this.props.vertices[0])
        for (let i=0; i<this.props.vertices.length; i++) {
          this.lineTo_mm(context, this.props.vertices[i])
        }
        context.stroke()
      }

      // Draw the specific vertices
      context.beginPath()
      context.lineWidth = this.mmToPixelsScale()
      context.strokeStyle = "yellow"
      this.moveTo_mm(context, drawing_vertices[0])
      for (let i=0; i<drawing_vertices.length; i++) {
        this.lineTo_mm(context, drawing_vertices[i])
      }
      context.stroke()
    }

    // Draw the trackVertices
    if (this.props.trackVertices && this.props.trackVertices.length > 0 && this.props.showTrack) {
      // Draw the track vertices
      context.beginPath()
      context.lineWidth = this.mmToPixelsScale()
      context.strokeStyle = "green"
      this.moveTo_mm(context, this.props.trackVertices[0])
      for (let i=0; i<this.props.trackVertices.length; i++) {
        this.lineTo_mm(context, this.props.trackVertices[i])
      }
      context.stroke()
    }

    context.restore()
  }

  resize(canvas, bigBox) {
    var size = parseInt(getComputedStyle(bigBox).getPropertyValue('width'),10) - 100

    if (this.props.canvasWidth !== size) {
      this.props.onResize(size)
    }
    var context = canvas.getContext('2d')
    this.paint(context)
  }

  render() {
    const {canvasWidth, canvasHeight} = this.props
    return (
      <canvas
        className="preview-canvas"
        id="preview-canvas"
        height={canvasHeight}
        width={canvasWidth} />
    )
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(PreviewWindow)
