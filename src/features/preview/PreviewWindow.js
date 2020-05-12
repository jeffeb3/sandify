import React, { Component } from 'react'
import { connect, ReactReduxContext, Provider } from 'react-redux'
import { Stage, Layer, Circle, Rect } from 'react-konva'
import throttle from 'lodash/throttle'
import { setPreviewSize, updatePreview } from './previewSlice'
import { updateTransform } from '../transforms/transformsSlice'
import { getCurrentTransformSelector } from '../shapes/selectors'
import { roundP } from '../../common/util'
import PreviewShape from './PreviewShape'

export const relativeScale = (props) => {
  let width, height

  if (props.use_rect) {
    width = props.maxX - props.minX
    height = props.maxY - props.minY
  } else {
    width = height = props.maxRadius * 2.0
  }

  // keep it square
  return Math.min(props.canvasWidth / width, props.canvasHeight / height)
}

const mapStateToProps = (state, ownProps) => {
  const transform = getCurrentTransformSelector(state)

  return {
    transform: transform,
    selectedId: state.preview.selectedId,
    use_rect: state.machine.rectangular,
    minX: state.machine.minX,
    maxX: state.machine.maxX,
    minY: state.machine.minY,
    maxY: state.machine.maxY,
    maxRadius: state.machine.maxRadius,
    canvasWidth: state.preview.canvasWidth,
    canvasHeight: state.preview.canvasHeight,
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
    onTransformChange: (attrs) => {
      dispatch(updateTransform(attrs))
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
    const size = Math.max(Math.min(width, height))

    if (this.props.canvasWidth !== size) {
      this.props.onResize(size)
    }
  }

  render() {
    const {minX, minY, maxX, maxY} = this.props
    const radius = this.props.maxRadius
    const scale = relativeScale(this.props)
    const reduceScale = 0.95
    const width = this.props.use_rect ? maxX - minX : radius * 2
    const height = this.props.use_rect ? maxY - minY : radius * 2
    const visibilityClass = `preview-wrapper ${this.visible ? 'd-flex align-items-center' : 'd-none'}`

    const checkDeselect = e => {
      // deselect when clicked on empty area
      if (e.target.className !== undefined && e.target.className !== 'Rect') {
        this.props.onChange({selectedId: null})
      }
     }

     // define Konva clip functions that will let us clip vertices not bound by
     // machine limits when dragging, and produce a visually seamless experience.
     const clipCircle = ctx => {
       ctx.arc(0, 0, radius, 0, Math.PI * 2, false)
     }
     const clipRect = ctx => {
       ctx.rect(-width/2, -height/2, width, height)
     }

    const scaleByWheel = (size, deltaY) => {
      const sign = Math.sign(deltaY)
      const scale = 1 + Math.log(Math.abs(deltaY))/30 * sign
      let newSize = Math.max(roundP(size * scale, 0), 1)
      if (newSize === size) {
        // If the log scaled value isn't big enough to move the scale.
        newSize = Math.max(sign+size, 1)
      }
      return newSize
    }
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
            onMouseDown={checkDeselect}
            onTouchStart={checkDeselect}
            offsetX={-width/2*(1/reduceScale)}
            offsetY={-height/2*(1/reduceScale)}
            onWheel={e => {
              e.evt.preventDefault()
              if (Math.abs(e.evt.deltaY) > 0) {
                this.props.onTransformChange({
                  startingSize: scaleByWheel(this.props.transform.startingSize, e.evt.deltaY),
                  id: this.props.selectedId
                })
              }
            }}
            >
            <Provider store={store}>
              <Layer clipFunc={this.props.use_rect ? clipRect : clipCircle}>
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
                <PreviewShape />
              </Layer>
            </Provider>
          </Stage>
        )}
      </ReactReduxContext.Consumer>
    )
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(PreviewWindow)
