import React, { Component } from 'react'
import { connect } from 'react-redux'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import PreviewWindow from './PreviewWindow'
import Downloader from '../exporter/Downloader'
import { updatePreview } from './previewSlice'
import { getVerticesStats } from '../machine/selectors'
import './MachinePreview.scss'

const mapStateToProps = (state, ownProps) => {
  return {
    sliderValue: state.preview.sliderValue,
    verticesStats: getVerticesStats(state),
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSlider: (value) => {
      dispatch(updatePreview({sliderValue: value}))
    },
  }
}

class MachinePreview extends Component {
  render() {
    return (
      <div className="machine-preview d-flex flex-grow-1 flex-column" id="machine-preview">
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
