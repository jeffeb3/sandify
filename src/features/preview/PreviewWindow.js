import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import Victor from 'victor'
import { setPreviewSize } from './previewSlice'
import { transformShape } from '../machine/computer'
import { getVertices } from '../machine/selectors'
import { createSelector } from 'reselect'
import throttle from 'lodash/throttle'
import Color from 'color'

const getTransforms = state => state.transforms
const getShapes = state => state.shapes

const getTrackVertices = createSelector(
  [
    getShapes,
    getTransforms
  ],
  (shapes, transforms) => {
    const currentTransform = transforms.byId[shapes.currentId]
    const numLoops = currentTransform.numLoops
    var trackVertices = []

    for (var i=0; i<numLoops; i++) {
      if (currentTransform.trackEnabled) {
        trackVertices.push(transformShape(currentTransform, {x: 0.0, y: 0.0}, i, i))
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
    canvasWidth: state.preview.canvasWidth,
    canvasHeight: state.preview.canvasHeight,
    vertices: getVertices(state),
    sliderValue: state.preview.sliderValue,
    showTrack: state.app.input === 'shape',
    trackVertices: getTrackVertices(state),
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onResize: (size) => {
      dispatch(setPreviewSize(size))
    },
  }
}

// Contains the preview window, and any parameters for the machine.
class PreviewWindow extends Component {
  componentDidMount() {
    const canvas = ReactDOM.findDOMNode(this)
    const context = canvas.getContext('2d')
    const bigBox = document.getElementById("preview-wrapper")

    this.throttledResize = throttle(this.resize, 200, {trailing: true}).bind(this)

    window.addEventListener('resize', () => { this.throttledResize(canvas, bigBox) }, false)
    setTimeout(() => {
      this.visible = true
      this.resize(canvas, bigBox)
    }, 250)
    this.paint(context)
  }

  componentDidUpdate() {
    var canvas = ReactDOM.findDOMNode(this)
    var context = canvas.getContext('2d')
    context.clearRect(0, 0, this.props.canvasWidth, this.props.canvasHeight)
    var bigBox = document.getElementById("preview-wrapper")

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

      return new Victor(x, y)
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

  sliderVertexRange(vertices, sliderValue) {
    const slide_size = 10.0
    if (sliderValue === 0) {
      return [0, vertices.length - 1]
    }

    // Let's start by just assuming we want a slide_size sized window, as a percentage of the whole
    // thing.
    const begin_fraction = sliderValue / 100.0
    const end_fraction = (slide_size + sliderValue) / 100.0
    let begin_vertex = Math.round(vertices.length * begin_fraction)
    let end_vertex = Math.round(vertices.length * end_fraction)

    // never return less than two vertices; this keeps the preview slider smooth even when
    // there are just a few vertices
    if (begin_vertex === end_vertex) {
      if (begin_vertex > 1) begin_vertex = begin_vertex - 2
    } else if (begin_vertex === end_vertex - 1) {
      if (begin_vertex > 0) begin_vertex = begin_vertex - 1
    }

    return [begin_vertex, end_vertex]
  }

  paint(context) {
    context.save()

    // Draw the bounds of the machine
    context.beginPath()
    context.lineWidth = "1"
    context.strokeStyle = "lightblue"
    if (this.props.use_rect) {
      this.moveTo_mm(context, new Victor((this.props.minX - this.props.maxX)/2.0, (this.props.minY - this.props.maxY)/2.0))
      this.lineTo_mm(context, new Victor((this.props.maxX - this.props.minX)/2.0, (this.props.minY - this.props.maxY)/2.0))
      this.lineTo_mm(context, new Victor((this.props.maxX - this.props.minX)/2.0, (this.props.maxY - this.props.minY)/2.0))
      this.lineTo_mm(context, new Victor((this.props.minX - this.props.maxX)/2.0, (this.props.maxY - this.props.minY)/2.0))
      this.lineTo_mm(context, new Victor((this.props.minX - this.props.maxX)/2.0, (this.props.minY - this.props.maxY)/2.0))
    } else {
      this.moveTo_mm(context, new Victor(this.props.maxRadius, 0.0))
      let resolution = 128.0
      for (let i=0; i<=resolution; i++) {
        let angle = Math.PI * 2.0 / resolution * i
        this.lineTo_mm(context, new Victor(this.props.maxRadius * Math.cos(angle),
                                       this.props.maxRadius * Math.sin(angle)))
      }
    }
    context.stroke()

    if (this.props.vertices && this.props.vertices.length > 0) {
      let sliderRange = this.sliderVertexRange(this.props.vertices, this.props.sliderValue)
      let drawing_vertices = this.props.vertices.slice(sliderRange[0], sliderRange[1] + 1)

      // Draw the background vertices
      if (this.props.sliderValue !== 0) {
        context.beginPath()
        context.lineWidth = this.mmToPixelsScale()
        context.strokeStyle = Color('#6E6E00')
        this.moveTo_mm(context, this.props.vertices[0])

        for (let i=0; i<this.props.vertices.length; i++) {
          if (i === sliderRange[1]-1) {
            context.stroke()
            context.beginPath()
            context.strokeStyle = "rgba(204, 204, 204, 0.35)"
          }
          this.lineTo_mm(context, this.props.vertices[i])
        }
        context.stroke()
      }

      if (this.props.trackVertices && this.props.trackVertices.length > 0 && this.props.showTrack) {
        // Draw the track vertices
        context.beginPath()
        context.lineWidth = 6.0
        context.strokeStyle = "green"
        this.moveTo_mm(context, this.props.trackVertices[0])
        for (let i=0; i<this.props.trackVertices.length; i++) {
          this.lineTo_mm(context, this.props.trackVertices[i])
        }
        context.stroke()
      }

      if (drawing_vertices.length > 0) {
        // Draw the slider path vertices
        var startColor = Color('#6E6E00')
        const colorStep = 200.0 / drawing_vertices.length / 100

        context.beginPath()
        context.lineWidth = this.mmToPixelsScale()
        this.moveTo_mm(context, drawing_vertices[0])
        context.stroke()

        for (let i=1; i<drawing_vertices.length; i++) {
          const strokeColor = this.props.sliderValue !== 0 ? startColor.lighten(colorStep * i).hex() : 'yellow'

          context.beginPath()
          context.strokeStyle = strokeColor
          context.lineWidth = this.mmToPixelsScale()
          this.moveTo_mm(context, drawing_vertices[i-1])
          this.lineTo_mm(context, drawing_vertices[i])
          context.stroke()
        }
      }

      // Draw the start and end points
      context.beginPath()
      context.lineWidth = 4.0
      context.strokeStyle = "green"
      this.dot_mm(context, this.props.vertices[0])
      context.stroke()
      context.beginPath()
      context.lineWidth = 4.0
      context.strokeStyle = "red"
      this.dot_mm(context, this.props.vertices[this.props.vertices.length-1])
      context.stroke()

      // Draw a slider path end point if sliding
      if (drawing_vertices.length > 0 && this.props.sliderValue !== 0) {
        const sliderEndPoint = drawing_vertices[drawing_vertices.length - 1]

        context.beginPath()
        context.strokeStyle = "yellow"
        context.lineWidth = 6.0
        this.dot_mm(context, sliderEndPoint)

        // START: uncomment these lines to show slider end point coordinates
        // context.font = "20px Arial"
        // context.fillText('(' + sliderEndPoint.x.toFixed(2) + ', ' + sliderEndPoint.y.toFixed(2) + ')', 10, 50)
        // END
        context.stroke()
      }
    }

    context.restore()
  }

  resize(canvas, bigBox) {
    const width = parseInt(getComputedStyle(bigBox).getPropertyValue('width'))
    const height = parseInt(getComputedStyle(bigBox).getPropertyValue('height'))
    const size = Math.max(Math.min(width, height))

    if (this.props.canvasWidth !== size) {
      this.props.onResize(size)
    }

    var context = canvas.getContext('2d')
    this.paint(context)
  }

  render() {
    const {canvasWidth, canvasHeight} = this.props
    const visibilityClass = `preview-canvas ${this.visible ? 'd-inline' : 'd-none'}`

    return (
      <canvas
        className={visibilityClass}
        height={canvasHeight}
        width={canvasWidth} />
    )
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(PreviewWindow)
