import React from 'react'
import { useSelector, shallowEqual } from 'react-redux'
import { Shape } from 'react-konva'
import { makeGetConnectorVertices, getSliderBounds, getSliderColors, getVertexOffsets } from '../machine/selectors'
import { getPreview, getLayers } from '../store/selectors'
import { getCurrentLayer, makeGetLayer } from '../layers/selectors'
import { getCachedSelector } from '../store/selectors'
import PreviewHelper from './PreviewHelper'

// Renders a connector between two layers.
const PreviewConnector = (ownProps) => {
  const mapStateToProps = (state) => {
    // if a layer matching this shape's id does not exist, we have a zombie
    // child. It has to do with a child (preview shape) subscribing to the store
    // before its parent (preview window), and trying to render first after a
    // layer is removed. This is a tangled, but well-known problem with React-Redux
    // hooks, and the solution for now is to render the current layer instead.
    // https://react-redux.js.org/api/hooks#stale-props-and-zombie-children
    // It's quite likely there is a more elegant/proper way around this.
    const startLayer = getCachedSelector(makeGetLayer, ownProps.startId)(state) || getCurrentLayer(state)
    const endLayer = getCachedSelector(makeGetLayer, ownProps.endId)(state) || getCurrentLayer(state)
    const vertices = startLayer === endLayer ?
      [] :
      getCachedSelector(makeGetConnectorVertices, startLayer.id, endLayer.id)(state)
    const layers = getLayers(state)
    const preview = getPreview(state)

    return {
      layer: startLayer,
      endLayer: endLayer,
      vertices: vertices,
      sliderValue: preview.sliderValue,
      selected: layers.selected,
      colors: getSliderColors(state),
      offsetId: startLayer.id + '-connector',
      offsets: getVertexOffsets(state),
      bounds: getSliderBounds(state)
    }
  }

  const props = useSelector(mapStateToProps, shallowEqual)
  const helper = new PreviewHelper(props)
  const selectedColor = 'yellow'
  const unselectedColor = 'rgba(195, 214, 230, 0.65)'
  const backgroundSelectedColor = '#6E6E00'
  const backgroundUnselectedColor = 'rgba(195, 214, 230, 0.4)'
  const isSliding = props.sliderValue !== 0
  const isSelected = props.selected === ownProps.endId

  // used by Konva to draw shape
  function sceneFunc(context, shape) {
    drawConnector(context)
    helper.drawSliderEndPoint(context)
    context.fillStrokeShape(shape)
  }

  // used by Konva to mark boundaries of shape
  function hitFunc(context) {
    context.fillStrokeShape(this)
  }

  function drawConnector(context) {
    const { end } = props.bounds
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
        let absoluteI = props.offsets[props.endLayer.id].start - props.vertices.length + i
        let pathColor = (absoluteI <= end ? backgroundSelectedColor : backgroundUnselectedColor)

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

  return (
    <React.Fragment>
      {!props.layer.dragging && !props.endLayer.dragging && <Shape
        offsetX={props.layer.startingWidth/2}
        offsetY={props.layer.startingHeight/2}
        sceneFunc={sceneFunc}
        hitFunc={hitFunc}
      >
      </Shape>}
    </React.Fragment>
  )
}

export default PreviewConnector
