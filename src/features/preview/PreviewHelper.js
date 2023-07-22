import Victor from "victor"

// translates shape coordinates into pixel coordinates with a centered origin
export default class PreviewHelper {
  constructor(props) {
    this.props = props
    this.width = this.props.layerState.width || 0
    this.height = this.props.layerState.height || 0
  }

  toPixels(vertex) {
    // y for pixels starts at the top, and goes down
    if (vertex) {
      return new Victor(vertex.x + this.width / 2, -vertex.y + this.height / 2)
    } else {
      return new Victor(0, 0)
    }
  }

  moveTo(context, vertex) {
    const px = this.toPixels(vertex)
    context.moveTo(px.x, px.y)
  }

  lineTo(context, vertex) {
    const px = this.toPixels(vertex)
    context.lineTo(px.x, px.y)
  }

  dot(context, vertex, radius = 4, color = "yellow") {
    const px = this.toPixels(vertex)
    context.arc(px.x, px.y, radius, 0, 2 * Math.PI, true)
    context.fillStyle = context.strokeStyle
    context.fill()
    context.lineWidth = 1
    context.strokeStyle = color
    context.stroke()
  }

  drawSliderEndPoint(context) {
    const { end } = this.props.bounds

    // Draw a slider path end point if sliding
    if (this.props.sliderValue !== 0) {
      const offsets = this.props.offsets[this.props.offsetId]

      // If the offset is past the end, then we won't set the slider end
      if (offsets && end >= offsets.start && end <= offsets.end) {
        const sliderEnd = this.props.vertices[end - offsets.start]

        if (sliderEnd) {
          context.beginPath()

          this.moveTo(context, sliderEnd)
          context.strokeStyle = "yellow"
          this.dot(context, sliderEnd)
          context.stroke()

          this.markOriginalCoordinates(context, sliderEnd)
        }
      }
    }
  }

  markOriginalCoordinates(context, vertex) {
    if (this.props.markCoordinates && !this.props.currentLayer.dragging) {
      const signX = vertex.x < 0 ? 1 : -1
      const signY = vertex.y < 0 ? -1 : 1
      const x = (vertex.origX || vertex.x).toFixed(2)
      const y = (vertex.origY || vertex.y).toFixed(2)

      context.fillStyle = "white"
      context.font = "10px Arial"
      context.fillText(
        "" + x + ", " + y,
        vertex.x + 15 * signX,
        -vertex.y + 5 * signY,
      )
    }
  }
}
