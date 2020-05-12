import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Shape, Transformer } from 'react-konva'
import Color from 'color'
import Victor from 'victor'
import { updatePreview } from './previewSlice'
import { getPreviewVertices, getPreviewTrackVertices } from '../machine/selectors'
import { getCurrentTransformSelector } from '../shapes/selectors'
import { updateTransform } from '../transforms/transformsSlice'
import { roundP } from '../../common/util'

const mapStateToProps = (state, ownProps) => {
  const transform = getCurrentTransformSelector(state)
  const hasImported = (state.app.input === 'code' || state.importer.fileName)

  return {
    use_rect: state.machine.rectangular,
    minX: state.machine.minX,
    maxX: state.machine.maxX,
    minY: state.machine.minY,
    maxY: state.machine.maxY,
    maxRadius: state.machine.maxRadius,
    canvasWidth: state.preview.canvasWidth,
    canvasHeight: state.preview.canvasHeight,
    transform: transform,
    trackVertices: getPreviewTrackVertices(state),
    vertices: getPreviewVertices(state),
    selectedId: state.preview.selectedId,
    sliderValue: state.preview.sliderValue,
    showTrack: state.app.input === 'shape' || !hasImported,
  }
}

// Renders the shapes in the preview window and allows the user to interact with the shape.
const PreviewShape = () => {
  const props = useSelector(mapStateToProps)
  const dispatch = useDispatch()
  const startingSize = props.transform.startingSize
  const isSelected = props.selectedId !== null

  function mmToPixels(vertex) {
    // Y for pixels starts at the top, and goes down.
    return new Victor(vertex.x + startingSize/2, -vertex.y + startingSize/2)
  }

  function moveTo_mm(context, vertex) {
    var in_mm = mmToPixels(vertex)
    context.moveTo(in_mm.x, in_mm.y)
  }

  function lineTo_mm(context, vertex) {
    var in_mm = mmToPixels(vertex)
    context.lineTo(in_mm.x, in_mm.y)
  }

  function dot_mm(context, vertex) {
    var in_mm = mmToPixels(vertex)
    context.arc(in_mm.x, in_mm.y, Math.max(4.0, 1.5), 0, 2 * Math.PI, true)
    context.fillStyle = context.strokeStyle
    context.fill()
  }

  function sliderVertexRange(vertices, sliderValue) {
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

  function paint(context, shape) {
    if (props.vertices && props.vertices.length > 0) {
      let sliderRange = sliderVertexRange(props.vertices, props.sliderValue)
      let drawing_vertices = props.vertices.slice(sliderRange[0], sliderRange[1] + 1)

      // Draw the background vertices
      if (props.sliderValue !== 0) {
        context.beginPath()
        context.lineWidth = 1
        context.strokeStyle = Color('#6E6E00')
        moveTo_mm(context, props.vertices[0])

        for (let i=0; i<props.vertices.length; i++) {
          if (i === sliderRange[1]-1) {
            context.stroke()
            context.beginPath()
            context.strokeStyle = "rgba(204, 204, 204, 0.35)"
          }
          lineTo_mm(context, props.vertices[i])
        }
        context.stroke()
      }

      if (props.trackVertices && props.trackVertices.length > 0 && props.showTrack) {
        // Draw the track vertices
        context.beginPath()
        context.lineWidth = 4.0
        context.strokeStyle = "green"
        moveTo_mm(context, props.trackVertices[0])
        for (let i=0; i<props.trackVertices.length; i++) {
          lineTo_mm(context, props.trackVertices[i])
        }
        context.stroke()
      }

      if (drawing_vertices.length > 0) {
        // Draw the slider path vertices
        var startColor = Color('#6E6E00')
        const colorStep = 200.0 / drawing_vertices.length / 100

        context.beginPath()
        context.lineWidth = 1
        moveTo_mm(context, drawing_vertices[0])
        context.stroke()

        for (let i=1; i<drawing_vertices.length; i++) {
          const strokeColor = props.sliderValue !== 0 ? startColor.lighten(colorStep * i).hex() : 'yellow'

          context.beginPath()
          context.strokeStyle = strokeColor
          context.lineWidth = 1
          moveTo_mm(context, drawing_vertices[i-1])
          lineTo_mm(context, drawing_vertices[i])
          context.stroke()
        }
      }

      // Draw the start and end points
      context.beginPath()
      context.lineWidth = 2.0
      context.strokeStyle = "green"
      dot_mm(context, props.vertices[0])
      context.stroke()
      context.beginPath()
      context.lineWidth = 2.0
      context.strokeStyle = "red"
      dot_mm(context, props.vertices[props.vertices.length-1])
      context.stroke()

      // Draw a slider path end point if sliding
      if (drawing_vertices.length > 0 && props.sliderValue !== 0) {
        const sliderEndPoint = drawing_vertices[drawing_vertices.length - 1]

        context.beginPath()
        context.strokeStyle = "yellow"
        context.lineWidth = 6.0
        dot_mm(context, sliderEndPoint)

        // START: uncomment these lines to show slider end point coordinates
        // context.font = "20px Arial"
        // context.fillText('(' + sliderEndPoint.x.toFixed(2) + ', ' + sliderEndPoint.y.toFixed(2) + ')', 10, 50)
        // END
        context.stroke()
      }
    }

    // normally, when you define a custom Konva shape, you let Konva handle
    // styling and scaling. For now, we're doing some of that ourselves.
    // Because of that, we'll draw an invisible rectangle and pass it
    // Konva (calling fillStrokeShape instead of the normal stroke).
    // This will determine the size of the transformer.
    context.beginPath()
    const size = props.transform.startingSize/2
    moveTo_mm(context, new Victor(-size, -size))
    lineTo_mm(context, new Victor(size, -size))
    lineTo_mm(context, new Victor(size, size))
    lineTo_mm(context, new Victor(-size, size))
    lineTo_mm(context, new Victor(-size, -size))

    context.fillStrokeShape(shape)
  }

  function onChange(attrs) {
    attrs.id = props.transform.id
    dispatch(updateTransform(attrs))
  }

  function onPreviewChange(attrs) {
    dispatch(updatePreview(attrs))
  }

  function onSelect() {
    dispatch(updatePreview({selectedId: props.selectedId == null ? props.transform.id : null }))
  }

  // used by konva to determine the boundaries of the shape; we're defining the
  // boundaries as the total machine area; this lets the user drag the shape by
  // clicking anywhere in the preview.
  function hitFunc(context) {
    context.beginPath()

    if (props.use_rect) {
      const width = props.maxX - props.minX
      const height = props.maxY - props.minY
      const size = props.transform.startingSize/2
      context.rect(size - width/2 - props.transform.offsetX, size - height/2 + props.transform.offsetY, width, height)
    } else {
      context.arc(props.maxRadius/4-props.transform.offsetX, props.maxRadius/4+props.transform.offsetY, props.maxRadius, 0, Math.PI * 2)
    }
    context.closePath()
    context.fillStrokeShape(this)
  }

  const shapeRef = React.createRef()
  const trRef = React.createRef()

  React.useEffect(() => {
    if (isSelected && props.transform.canChangeSize && props.showTrack) {
      // we need to attach transformer manually
      trRef.current.nodes([shapeRef.current])
      trRef.current.getLayer().batchDraw()
    }
  }, [isSelected, props.transform, props.showTrack, shapeRef, trRef])

  return (
    <React.Fragment>
      <Shape
        draggable={props.showTrack}
        width={startingSize}
        height={startingSize}
        offsetY={startingSize/2}
        offsetX={startingSize/2}
        x={(props.showTrack && props.transform.offsetX) || 0}
        y={(props.showTrack && -props.transform.offsetY) || 0}
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...props}
        sceneFunc={paint}
        strokeWidth={1}
        rotation={(props.showTrack && props.transform.rotation) || 0}
        hitFunc={hitFunc}
        onDragStart={e => {
          onPreviewChange({dragging: true})
        }}
        onDragEnd={e => {
          onPreviewChange({dragging: false})
          onChange({
            offsetX: roundP(e.target.x(), 0),
            offsetY: roundP(-e.target.y(), 0)
          })
        }}
        onTransformStart={e => {
          onPreviewChange({dragging: true})
        }}
        onTransformEnd={e => {
          const node = shapeRef.current
          const scaleX = node.scaleX()
          // const scaleY = node.scaleY()

          // we will reset it back
          node.scaleX(1)
          node.scaleY(1)

          onPreviewChange({dragging: false})
          onChange({
            startingSize: roundP(Math.max(5, props.transform.startingSize * scaleX), 0),
            rotation: roundP(node.rotation(), 0)
          })
        }}
      />
      {isSelected && props.transform.canChangeSize && props.showTrack && (
        <Transformer
          ref={trRef}
          centeredScaling={true}
          resizeEnabled={!props.transform.trackEnabled}
          rotationSnaps={[0, 90, 180, 270]}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
        />
      )}
    </React.Fragment>
  )
}

export default PreviewShape
