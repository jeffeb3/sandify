import React, { Component } from "react"
import { connect } from "react-redux"
import Slider from "rc-slider"
import "rc-slider/assets/index.css"
import Downloader from "@/features/exporter/Downloader"
import { getFontsState } from "@/features/store/selectors"
import { getCurrentLayer } from "@/features/layers/selectors"
import { getLayersState, getPreviewState } from "@/features/store/selectors"
import { updateLayer } from "@/features/layers/layersSlice"
import { getVerticesStats } from "@/features/machine/selectors"
import "./Preview.scss"
import { updatePreview } from "./previewSlice"
import PreviewWindow from "./PreviewWindow"

const mapStateToProps = (state, ownProps) => {
  const fonts = getFontsState(state)
  if (!fonts.loaded) {
    return {}
  }

  const preview = getPreviewState(state)
  const current = getCurrentLayer(state)
  const layers = getLayersState(state)

  return {
    currentLayer: current,
    currentLayerSelected: layers.selected === current.id,
    sliderValue: preview.sliderValue,
    verticesStats: getVerticesStats(state),
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSlider: (value) => {
      dispatch(updatePreview({ sliderValue: value }))
    },
    onLayerChange: (attrs) => {
      dispatch(updateLayer(attrs))
    },
    onKeyDown: (event, currentLayer) => {
      let attrs = { id: currentLayer.id }

      if (currentLayer.canMove) {
        if (
          ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(
            event.key,
          )
        ) {
          const delta = event.shiftKey ? 1 : 5

          if (event.key === "ArrowDown") {
            attrs.y = currentLayer.y - delta
          } else if (event.key === "ArrowUp") {
            attrs.y = currentLayer.y + delta
          } else if (event.key === "ArrowLeft") {
            attrs.x = currentLayer.x - delta
          } else if (event.key === "ArrowRight") {
            attrs.x = currentLayer.x + delta
          }

          dispatch(updateLayer(attrs))
        }
      }
    },
  }
}

class Preview extends Component {
  componentDidMount() {
    if (this.props.currentLayer) {
      // ensures that arrow keys always work
      this.el.focus()
    }
  }

  render() {
    const {
      currentLayer,
      currentLayerSelected,
      sliderValue,
      verticesStats,
      onSlider,
      onKeyDown,
    } = this.props

    if (currentLayer) {
      return (
        <div
          className="machine-preview d-flex flex-grow-1 flex-column"
          id="machine-preview"
        >
          <div className="flex-grow-1 d-flex flex-column">
            <div
              id="preview-wrapper"
              className="preview-wrapper d-flex flex-column align-items-center"
              ref={(el) => {
                this.el = el
              }}
              tabIndex={0}
              onKeyDown={(e) => {
                if (currentLayerSelected) {
                  onKeyDown(e, currentLayer)
                }
              }}
            >
              <PreviewWindow />
            </div>

            <div className="mt-auto pt-2 bg-white d-flex align-items-center">
              <div className="flex-grow-1">
                <div className="mx-2">
                  Points: {verticesStats.numPoints}, Distance:{" "}
                  {verticesStats.distance}
                </div>

                <div className="p-3">
                  <Slider
                    value={sliderValue}
                    step={1}
                    min={0.0}
                    max={100.0}
                    onChange={onSlider}
                  />
                </div>
              </div>
              <Downloader />
            </div>
          </div>
        </div>
      )
    } else {
      return <div></div>
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Preview)
