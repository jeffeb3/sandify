import React from 'react'
import { useSelector, useDispatch, shallowEqual } from 'react-redux'
import { Shape, Transformer } from 'react-konva'
import Color from 'color'
import Victor from 'victor'
import { updatePreview } from './previewSlice'
import { getPreviewTrackVertices, getCachedSelector, makeGetPreviewVertices } from '../machine/selectors'
import { updateLayer, setSelectedLayer } from '../layers/layersSlice'
import { getCurrentLayer, makeGetLayerIndex, getNumLayers } from '../layers/selectors'
import { roundP } from '../../common/util'

// Renders the shapes in the preview window and allows the user to interact with the shape.
const PreviewShape = (ownProps) => {
  const mapStateToProps = (state) => {
    // if a layer matching this shape's id does not exist, we have a zombie
    // child. It has to do with a child (preview shape) subscribing to the store
    // before its parent (preview window), and trying to render first after a
    // layer is removed. This is a tangled, but well-known problem with React-Redux
    // hooks, and the solution for now is to render the current layer instead.
    // https://react-redux.js.org/api/hooks#stale-props-and-zombie-children
    // It's quite likely there is a more elegant/proper way around this.
    const layer = state.layers.byId[ownProps.id] || getCurrentLayer(state)

    return {
      layer: layer,
      layerIndex: getCachedSelector(makeGetLayerIndex, layer.id)(state),
      currentLayer: getCurrentLayer(state),
      numLayers: getNumLayers(state),
      trackVertices: getPreviewTrackVertices(state),
      vertices: getCachedSelector(makeGetPreviewVertices, layer.id)(state),
      selected: state.layers.selected,
      sliderValue: state.preview.sliderValue,
      showTrack: true,
    }
  }

  const props = useSelector(mapStateToProps, shallowEqual)
  const dispatch = useDispatch()
  const startingSize = props.layer.startingSize

  // our transformer is 5 times bigger than the actual starting shape, so we need
  // to account for it when drawing the preview; if you change this value, be sure
  // to change it in machine/selectors#getPreviewVertices,getPreviewTrackVertices
  const konvaScale = 5
  const konvaSize = startingSize * konvaScale
  const isSelected = props.selected === ownProps.id

  function mmToPixels(vertex) {
    // y for pixels starts at the top, and goes down.
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

  function sceneFunc(context, shape) {
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
      if (props.layerIndex === 0) {
        context.beginPath()
        context.lineWidth = 2.0
        context.strokeStyle = "green"
        dot_mm(context, props.vertices[0])
        context.stroke()
      }

      if (props.layerIndex === props.numLayers - 1) {
        context.beginPath()
        context.lineWidth = 2.0
        context.strokeStyle = "red"
        dot_mm(context, props.vertices[props.vertices.length-1])
        context.stroke()
      }

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

    context.fillStrokeShape(shape)
  }

  function hitFunc(context) {
    const vertices = props.vertices
    if (vertices && vertices.length > 0) {
      moveTo_mm(context, vertices[0])

      for (let i=1; i<vertices.length; i++) {
        moveTo_mm(context, vertices[i-1])
        lineTo_mm(context, vertices[i])
      }
    }

    context.fillStrokeShape(this)
  }

  function onChange(attrs) {
    attrs.id = props.layer.id
    dispatch(updateLayer(attrs))
  }

  function onPreviewChange(attrs) {
    dispatch(updatePreview(attrs))
  }

  function onSelect() {
    dispatch(setSelectedLayer(props.selected == null ? props.currentLayer.id : null))
  }

  const shapeRef = React.createRef()
  const trRef = React.createRef()

  React.useEffect(() => {
    if (isSelected && props.layer.canChangeSize && props.showTrack) {
      // we need to attach transformer manually
      trRef.current.nodes([shapeRef.current])
      trRef.current.getLayer().batchDraw()
    }
  }, [isSelected, props.layer, props.showTrack, shapeRef, trRef])

  return (
    <React.Fragment>
      <Shape
        draggable={props.showTrack && props.layer.id === props.currentLayer.id}
        width={konvaSize}
        height={konvaSize}
        offsetY={konvaSize/2}
        offsetX={konvaSize/2}
        x={(props.showTrack && props.layer.offsetX) || 0}
        y={(props.showTrack && -props.layer.offsetY) || 0}
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...props}
        strokeWidth={1}
        rotation={(props.showTrack && props.layer.rotation) || 0}
        sceneFunc={sceneFunc}
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
            startingSize: roundP(Math.max(5, props.layer.startingSize * scaleX), 0),
            rotation: roundP(node.rotation(), 0)
          })
        }}
      />
      {isSelected && props.layer.canChangeSize && props.showTrack && (
        <Transformer
          ref={trRef}
          centeredScaling={true}
          resizeEnabled={!props.layer.trackEnabled}
          rotationSnaps={[0, 90, 180, 270]}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
        />
      )}
    </React.Fragment>
  )
}

export default PreviewShape
