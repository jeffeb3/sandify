import React, { Component } from 'react'
import { connect, ReactReduxContext, Provider } from 'react-redux'
import { Stage, Layer, Circle, Rect } from 'react-konva'
import throttle from 'lodash/throttle'
import { setPreviewSize, updatePreview } from './previewSlice'
import { updateLayer } from '../layers/layersSlice'
import { getMachine, getLayers, getPreview } from '../store/selectors'
import { getCurrentLayerState, getKonvaLayerIds, getVisibleNonEffectIds, isDragging } from '../layers/selectors'
import { roundP } from '../../common/util'
import PreviewLayer from './PreviewLayer'
import PreviewConnector from './PreviewConnector'

const mapStateToProps = (state, ownProps) => {
  const layers = getLayers(state)
  const preview = getPreview(state)
  const machine = getMachine(state)

  return {
    layers: layers,
    currentLayer: getCurrentLayerState(state),
    konvaIds: getKonvaLayerIds(state),
    layerIds: getVisibleNonEffectIds(state),
    use_rect: machine.rectangular,
    dragging: isDragging(state),
    minX: machine.minX,
    maxX: machine.maxX,
    minY: machine.minY,
    maxY: machine.maxY,
    maxRadius: machine.maxRadius,
    canvasWidth: preview.canvasWidth,
    canvasHeight: preview.canvasHeight
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onResize: (size) => {
      dispatch(setPreviewSize(size))
    },
    onChange: (attrs) => {
      dispatch(updatePreview(attrs))
    },
    onLayerChange: (attrs) => {
      dispatch(updateLayer(attrs))
    }
  }
}

// Contains the preview window, and any parameters for the machine.
class PreviewWindow extends Component {
  componentDidMount() {
    const wrapper = document.getElementById('preview-wrapper')

    this.throttledResize = throttle(this.resize, 200, {trailing: true}).bind(this)
    window.addEventListener('resize', () => { this.throttledResize(wrapper) }, false)
    setTimeout(() => {
      this.visible = true
      this.resize(wrapper)
    }, 250)
  }

  resize(wrapper) {
    const width = parseInt(getComputedStyle(wrapper).getPropertyValue('width'))
    const height = parseInt(getComputedStyle(wrapper).getPropertyValue('height'))

    if (this.props.canvasWidth !== width || this.props.canvasHeight !== height) {
      this.props.onResize({width: width, height: height})
    }
  }

  render() {
    const {minX, minY, maxX, maxY} = this.props
    const radius = this.props.maxRadius
    const scale = this.relativeScale(this.props)
    const reduceScale = 0.9
    const width = this.props.use_rect ? maxX - minX : radius * 2
    const height = this.props.use_rect ? maxY - minY : radius * 2
    const visibilityClass = `preview-wrapper ${this.visible ? 'd-flex align-items-center' : 'd-none'}`

    // define Konva clip functions that will let us clip vertices not bound by
    // machine limits when dragging, and produce a visually seamless experience.
    const clipCircle = ctx => {
     ctx.arc(0, 0, radius, 0, Math.PI * 2, false)
    }
    const clipRect = ctx => {
     ctx.rect(-width/2, -height/2, width, height)
    }
    const clipFunc = this.props.dragging ? (this.props.use_rect ? clipRect : clipCircle) : null

    return (
      // the consumer wrapper is needed to pass the store down to our shape
      // which is not our usual React Component
      <ReactReduxContext.Consumer>
        {({store}) => (
          <Stage className={visibilityClass}
            scaleX={scale * reduceScale}
            scaleY={scale * reduceScale}
            height={height * scale}
            width={width * scale}
            offsetX={-width/2*(1/reduceScale)}
            offsetY={-height/2*(1/reduceScale)}
            onWheel={e => {
              e.evt.preventDefault()
              if (Math.abs(e.evt.deltaY) > 0) {
                this.props.onLayerChange({
                  startingWidth: this.scaleByWheel(this.props.currentLayer.startingWidth, e.evt.deltaY),
                  startingHeight: this.scaleByWheel(this.props.currentLayer.startingHeight, e.evt.deltaY),
                  id: this.props.currentLayer.id
                })
              }
            }}
            >
            <Provider store={store}>
              <Layer clipFunc={clipFunc}>
                {!this.props.use_rect && <Circle x={0} y={0} radius={radius}
                  fill="transparent"
                  stroke="gray"
                />}
                {this.props.use_rect && <Rect x={0} y={0} width={width} height={height}
                  fill="transparent"
                  stroke="gray"
                  offsetX={width/2}
                  offsetY={height/2}
                />}
                {this.props.konvaIds.map((id, i) => {
                  const idx = this.props.layerIds.findIndex(layerId => layerId === id)
                  const nextId = idx !== -1 && idx < this.props.layerIds.length - 1 ? this.props.layerIds[idx + 1] : null
                  return (
                    [
                      nextId && <PreviewConnector startId={id} endId={nextId} key={'c-' + i} />,
                      <PreviewLayer id={id} key={i} index={i} />
                    ].filter(e => e !== null)
                  )
                }).flat()}
              </Layer>
            </Provider>
          </Stage>
        )}
      </ReactReduxContext.Consumer>
    )
  }

  relativeScale(props) {
    let width, height

    if (props.use_rect) {
      width = props.maxX - props.minX
      height = props.maxY - props.minY
    } else {
      width = height = props.maxRadius * 2.0
    }

    return Math.min(props.canvasWidth / width, props.canvasHeight / height)
  }

  scaleByWheel(size, deltaY) {
    const sign = Math.sign(deltaY)
    const scale = 1 + Math.log(Math.abs(deltaY))/30 * sign
    let newSize = Math.max(roundP(size * scale, 0), 1)

    if (newSize === size) {
      // If the log scaled value isn't big enough to move the scale.
      newSize = Math.max(sign+size, 1)
    }

    return newSize
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(PreviewWindow)
