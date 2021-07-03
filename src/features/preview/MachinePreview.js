import React, { Component } from 'react'
import { connect } from 'react-redux'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import PreviewWindow from './PreviewWindow'
import Downloader from '../exporter/Downloader'
import { getCurrentLayer } from '../layers/selectors'
import { updateLayer } from '../layers/layersSlice'
import { updatePreview } from './previewSlice'
import { getVerticesStats } from '../machine/selectors'
import './MachinePreview.scss'

const mapStateToProps = (state, ownProps) => {
  const current = getCurrentLayer(state)

  return {
    currentLayer: current,
    currentLayerSelected: state.layers.selected === current.id,
    sliderValue: state.preview.sliderValue,
    verticesStats: getVerticesStats(state),
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSlider: (value) => {
      dispatch(updatePreview({sliderValue: value}))
    },
    onLayerChange: (attrs) => {
      dispatch(updateLayer(attrs))
    },
    onKeyDown: (event, currentLayer) => {
      let attrs = { id: currentLayer.id }

      if (currentLayer.canMove) {
        if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
          const delta = !!event.shiftKey ? 1 : 5

          if (event.key === 'ArrowDown') {
            attrs.offsetY = currentLayer.offsetY - delta
          } else if (event.key === 'ArrowUp') {
            attrs.offsetY = currentLayer.offsetY + delta
          } else if (event.key === 'ArrowLeft') {
            attrs.offsetX = currentLayer.offsetX - delta
          } else if (event.key === 'ArrowRight') {
            attrs.offsetX = currentLayer.offsetX + delta
          }

          dispatch(updateLayer(attrs))
        }
      }
    }
  }
}

class MachinePreview extends Component {
  componentDidMount() {
    // ensures that arrow keys always work
    this.el.focus()
  }

  render() {
    return (
      <div className="machine-preview d-flex flex-grow-1 flex-column" id="machine-preview" ref={(el) => { this.el = el }} tabIndex={0} onKeyDown={e => {
        if (this.props.currentLayerSelected) {
          this.props.onKeyDown(e, this.props.currentLayer)
        }
      }}>
        <div className="flex-grow-1 d-flex flex-column">
          <div id="preview-wrapper" className="preview-wrapper d-flex flex-column align-items-center">
            <PreviewWindow />
          </div>

          <div className="mt-auto pt-2 bg-white d-flex align-items-center">
            <div className="flex-grow-1">
              <div className="mx-2">
                Points: {this.props.verticesStats.numPoints}, Distance: {this.props.verticesStats.distance}
              </div>

              <div className="p-3">
                  <Slider
                    value={this.props.sliderValue}
                    step={0.05}
                    min={0.0}
                    max={100.0}
                    onChange={this.props.onSlider}
                  />
              </div>
            </div>
            <Downloader />
          </div>
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MachinePreview)
