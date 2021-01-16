import React from 'react'
import { useSelector, useDispatch, shallowEqual } from 'react-redux'
import { Shape, Transformer } from 'react-konva'
import Victor from 'victor'
import { makeGetPreviewTrackVertices, getCachedSelector, makeGetPreviewVertices, getSliderColors, getVertexOffsets, getAllPreviewVertices } from '../machine/selectors'
import { updateLayer } from '../layers/layersSlice'
import { getCurrentLayer, makeGetLayerIndex, getNumVisibleLayers } from '../layers/selectors'
import { roundP } from '../../common/util'
import { getSliderBounds } from '../../common/geometry'

// Renders the shapes in the preview window and allows the user to interact with the shape.
const PreviewLayer = (ownProps) => {
  const mapStateToProps = (state) => {
    // if a layer matching this shape's id does not exist, we have a zombie
    // child. It has to do with a child (preview shape) subscribing to the store
    // before its parent (preview window), and trying to render first after a
    // layer is removed. This is a tangled, but well-known problem with React-Redux
    // hooks, and the solution for now is to render the current layer instead.
    // https://react-redux.js.org/api/hooks#stale-props-and-zombie-children
    // It's quite likely there is a more elegant/proper way around this.
    const layer = state.layers.byId[ownProps.id] || getCurrentLayer(state)
    const index = getCachedSelector(makeGetLayerIndex, layer.id)(state)
    const numLayers = getNumVisibleLayers(state)

    return {
      layer: layer,
      start: index === 0,
      end: index === numLayers - 1,
      currentLayer: getCurrentLayer(state),
      trackVertices: getCachedSelector(makeGetPreviewTrackVertices, layer.id)(state),
      vertices: getCachedSelector(makeGetPreviewVertices, layer.id)(state),
      allVertices: getAllPreviewVertices(state),
      selected: state.layers.selected,
      sliderValue: state.preview.sliderValue,
      showTrack: true,
      colors: state.layers.selected ? getSliderColors(state.layers.selected, state) : [],
      offsets: getVertexOffsets(state)
    }
  }

  const props = useSelector(mapStateToProps, shallowEqual)
  const dispatch = useDispatch()
  const startingWidth = props.layer.startingWidth
  const startingHeight = props.layer.startingHeight
  const selectedColor = 'yellow'
  const unselectedColor = 'rgba(195, 214, 230, 0.65)'
  const backgroundSelectedColor = '#6E6E00'
  const backgroundUnselectedColor = 'rgba(195, 214, 230, 0.4)'

  // our transformer is 5 times bigger than the actual starting shape, so we need
  // to account for it when drawing the preview; if you change this value, be sure
  // to change it in machine/selectors#getPreviewVertices,getPreviewTrackVertices
  const konvaScale = props.layer.autosize ? 5 : 1
  const konvaSizeX = startingWidth * konvaScale
  const konvaSizeY = startingHeight * konvaScale
  const isSelected = props.selected === ownProps.id
  const isSliding = props.sliderValue !== 0

  function mmToPixels(vertex) {
    // y for pixels starts at the top, and goes down.
    if (vertex) {
      return new Victor(vertex.x + startingWidth/2, -vertex.y + startingHeight/2)
    } else {
      return new Victor(0, 0)
    }
  }

  function moveTo_mm(context, vertex) {
    var in_mm = mmToPixels(vertex)
    context.moveTo(in_mm.x, in_mm.y)
  }

  function lineTo_mm(context, vertex) {
    var in_mm = mmToPixels(vertex)
    context.lineTo(in_mm.x, in_mm.y)
  }

  function dot_mm(context, vertex, radius=4) {
    var in_mm = mmToPixels(vertex)
    context.arc(in_mm.x, in_mm.y, radius, 0, 2 * Math.PI, true)
    context.fillStyle = context.strokeStyle
    context.fill()
    context.lineWidth = 1
    context.strokeStyle = isSelected ? 'yellow' : unselectedColor
    context.stroke()
  }

  // draws a colored path when user is using slider
  function drawLayerVertices(context) {
    const { end } = getSliderBounds(props.allVertices, props.sliderValue)
    const stationaryColor = unselectedColor
    const defaultColor = isSliding ? backgroundUnselectedColor : stationaryColor
    let oldColor = defaultColor
    let currentColor = defaultColor

    context.beginPath()
    context.lineWidth = 1
    context.strokeStyle = currentColor
    moveTo_mm(context, props.vertices[0])
    context.stroke()

    context.beginPath()
    for (let i=1; i<props.vertices.length; i++) {
      let absoluteI = i + props.offsets[props.layer.id]
      let pathColor = isSliding ? (absoluteI <= end ? backgroundSelectedColor : backgroundUnselectedColor) : stationaryColor

      currentColor = props.colors[absoluteI] || pathColor
      if (currentColor !== oldColor) {
        context.stroke()
        context.strokeStyle = currentColor
        oldColor = currentColor
        context.beginPath()
      }

      moveTo_mm(context, props.vertices[i-1])
      lineTo_mm(context, props.vertices[i])
    }
    context.stroke()
  }

  function drawStartAndEndPoints(context) {
    context.beginPath()
    context.strokeStyle = 'green'
    dot_mm(context, props.vertices[0], props.start ? 5 : 3)
    context.stroke()

    let endOffset = (props.currentLayer.dragging || props.end) ? 1 : 2
    context.beginPath()
    context.strokeStyle = 'red'
    dot_mm(context, props.vertices[props.vertices.length - endOffset], props.end ? 5 : 3)
    context.stroke()
  }

  // draws the line representing the track the path follows
  function drawTrackVertices(context) {
    context.beginPath()
    context.lineWidth = 4.0
    context.strokeStyle = 'green'
    moveTo_mm(context, props.trackVertices[0])
    for (let i=0; i<props.trackVertices.length; i++) {
      lineTo_mm(context, props.trackVertices[i])
    }
    context.stroke()
  }

  function drawSliderEndPoint(context) {
    const { end } = getSliderBounds(props.allVertices, props.sliderValue)

    // Draw a slider path end point if sliding
    if (isSliding) {
      let absoluteEnd = props.vertices.length + props.offsets[props.layer.id] - 1
      let absoluteStart = props.offsets[props.layer.id]

      if (end >= absoluteStart && end <= absoluteEnd) {
        // end point is in this layer
        const sliderEnd = props.allVertices[end]
        context.beginPath()
        context.strokeStyle = backgroundSelectedColor

        moveTo_mm(context, sliderEnd)
        context.strokeStyle = selectedColor
        dot_mm(context, sliderEnd)

        // START: uncomment these lines to show slider end point coordinates
        // context.font = '12px Arial'
        // context.fillText('(' + sliderEnd.x.toFixed(2) + ', ' + sliderEnd.y.toFixed(2) + ')', sliderEnd.x, -sliderEnd.y)
        // END
      }

      context.stroke()
    }
  }

  // used by Konva to draw our custom shape
  function sceneFunc(context, shape) {
    if (props.vertices && props.vertices.length > 0) {
      if (props.trackVertices && props.trackVertices.length > 0 && props.showTrack) {
        drawTrackVertices(context)
      }

      drawLayerVertices(context)
      if (props.start || props.end || isSelected) {
        drawStartAndEndPoints(context)
      }
      drawSliderEndPoint(context)
    }

    context.fillStrokeShape(shape)
  }

  // used by Konva to mark boundaries of shape
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

  function onSelect() {
    // deselection is currently disabled
    // dispatch(setSelectedLayer(props.selected == null ? props.currentLayer.id : null))
  }

  const shapeRef = React.createRef()
  const trRef = React.createRef()

  React.useEffect(() => {
    if (props.layer.visible && isSelected && props.layer.canChangeSize && props.showTrack) {
      // we need to attach transformer manually
      trRef.current.nodes([shapeRef.current])
      trRef.current.getLayer().batchDraw()
    }
  }, [isSelected, props.layer, props.showTrack, shapeRef, trRef])

  return (
    <React.Fragment>
      {props.layer.visible && <Shape
        draggable={props.showTrack && props.layer.id === props.currentLayer.id}
        width={konvaSizeX}
        height={konvaSizeY}
        offsetY={konvaSizeY/2}
        offsetX={konvaSizeX/2}
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
          onChange({dragging: true})
        }}
        onDragEnd={e => {
          onChange({
            dragging: false,
            offsetX: roundP(e.target.x(), 0),
            offsetY: roundP(-e.target.y(), 0)
          })
        }}
        onTransformStart={e => {
          onChange({dragging: true})
        }}
        onTransformEnd={e => {
          const node = shapeRef.current
          const scaleX = node.scaleX()
          const scaleY = node.scaleY()

          // we will reset it back
          node.scaleX(1)
          node.scaleY(1)

          onChange({
            dragging: false,
            startingWidth: roundP(Math.max(5, props.layer.startingWidth * scaleX), 0),
            startingHeight: roundP(Math.max(5, props.layer.startingHeight * scaleY), 0),
            rotation: roundP(node.rotation(), 0)
          })
        }}
      />}
      {props.layer.visible && isSelected && props.layer.canChangeSize && props.showTrack && (
        <Transformer
          ref={trRef}
          centeredScaling={true}
          resizeEnabled={!props.layer.trackEnabled}
          rotateEnabled={props.layer.canRotate}
          rotationSnaps={[0, 90, 180, 270]}
          enabledAnchors={!props.layer.canChangeHeight ? ['top-left', 'top-right', 'bottom-left', 'bottom-right'] : null }
        />
      )}
    </React.Fragment>
  )
}

export default PreviewLayer
