import React from 'react'
import { useSelector, useDispatch, shallowEqual } from 'react-redux'
import { Shape, Transformer } from 'react-konva'
import { makeGetPreviewTrackVertices, makeGetPreviewVertices, getSliderColors,
  getVertexOffsets, getAllComputedVertices, getSliderBounds } from '../machine/selectors'
import { updateLayer } from '../layers/layersSlice'
import { getLayers, getPreview } from '../store/selectors'
import { getCurrentLayer, makeGetLayerIndex, makeGetLayer, getNumVisibleLayers } from '../layers/selectors'
import { getCachedSelector } from '../store/selectors'
import { roundP } from '../../common/util'
import PreviewHelper from './PreviewHelper'

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
    const layers = getLayers(state)
    const layer = getCachedSelector(makeGetLayer, ownProps.id)(state) || getCurrentLayer(state)
    const index = getCachedSelector(makeGetLayerIndex, layer.id)(state)
    const numLayers = getNumVisibleLayers(state)
    const preview = getPreview(state)

    return {
      layer: layer,
      start: index === 0,
      end: index === numLayers - 1,
      currentLayer: getCurrentLayer(state),
      trackVertices: getCachedSelector(makeGetPreviewTrackVertices, layer.id)(state),
      vertices: getCachedSelector(makeGetPreviewVertices, layer.id)(state),
      allVertices: getAllComputedVertices(state),
      selected: layers.selected,
      sliderValue: preview.sliderValue,
      showTrack: true,
      colors: getSliderColors(state),
      offsets: getVertexOffsets(state),
      offsetId: layer.id,
      bounds: getSliderBounds(state),
      markCoordinates: false // debug feature: set to true to see coordinates while drawing
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
  const helper = new PreviewHelper(props)

  // draws a colored path when user is using slider
  function drawLayerVertices(context, bounds) {
    const { end } = bounds
    let oldColor = null
    let currentColor = isSelected ? selectedColor : unselectedColor

    context.beginPath()
    context.lineWidth = 1
    context.strokeStyle = currentColor
    helper.moveTo(context, props.vertices[0])
    context.stroke()

    context.beginPath()
    for (let i=1; i<props.vertices.length; i++) {
      if (isSliding) {
        let absoluteI = i + props.offsets[props.layer.id].start
        let pathColor = absoluteI <= end ? backgroundSelectedColor : backgroundUnselectedColor

        currentColor = props.colors[absoluteI] || pathColor
        if (currentColor !== oldColor) {
          context.stroke()
          context.strokeStyle = currentColor
          oldColor = currentColor
          context.beginPath()
        }
      }

      helper.moveTo(context, props.vertices[i-1])
      helper.lineTo(context, props.vertices[i])
    }
    context.stroke()
  }

  function drawStartAndEndPoints(context) {
    const start = props.vertices[0]
    const end = props.vertices[props.vertices.length - 1]

    context.beginPath()
    context.strokeStyle = 'green'
    helper.dot(context, start, props.start ? 5 : 3)
    helper.markOriginalCoordinates(context, start)

    if (end) {
      context.beginPath()
      context.strokeStyle = 'red'
      helper.dot(context, end, props.end ? 5 : 3)
      helper.markOriginalCoordinates(context, end)
    }
  }

  // draws the line representing the track the path follows
  function drawTrackVertices(context) {
    context.beginPath()
    context.lineWidth = 4.0
    context.strokeStyle = 'green'
    helper.moveTo(context, props.trackVertices[0])
    for (let i=0; i<props.trackVertices.length; i++) {
      helper.lineTo(context, props.trackVertices[i])
    }
    context.stroke()
  }

  // used by Konva to draw our custom shape
  function sceneFunc(context, shape) {
    if (props.vertices && props.vertices.length > 0) {
      if (props.trackVertices && props.trackVertices.length > 0) {
        drawTrackVertices(context)
      }

      drawLayerVertices(context, props.bounds)

      if (props.start || props.end || isSelected) {
        drawStartAndEndPoints(context)
      }
      helper.drawSliderEndPoint(context)
    }

    context.fillStrokeShape(shape)
  }

  // used by Konva to mark boundaries of shape
  function hitFunc(context) {
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
    if (props.layer.visible && isSelected && props.layer.canChangeSize) {
      // we need to attach transformer manually
      trRef.current.nodes([shapeRef.current])
      trRef.current.getLayer().batchDraw()
    }
  }, [isSelected, props.layer, props.currentLayer.canMove, shapeRef, trRef])

  return (
    <React.Fragment>
      {props.layer.visible && <Shape
        draggable={props.currentLayer.canMove && props.layer.id === props.currentLayer.id}
        width={konvaSizeX}
        height={konvaSizeY}
        offsetY={konvaSizeY/2}
        offsetX={konvaSizeX/2}
        x={props.layer.offsetX || 0}
        y={-props.layer.offsetY || 0}
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...props}
        strokeWidth={1}
        rotation={props.layer.rotation || 0}
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
      {props.layer.visible && isSelected && props.layer.canChangeSize && (
        <Transformer
          ref={trRef}
          centeredScaling={true}
          resizeEnabled={props.layer.canResize}
          rotateEnabled={props.layer.canRotate}
          rotationSnaps={[0, 90, 180, 270]}
          enabledAnchors={!props.layer.canChangeHeight ? ['top-left', 'top-right', 'bottom-left', 'bottom-right'] : null }
        />
      )}
    </React.Fragment>
  )
}

export default PreviewLayer
