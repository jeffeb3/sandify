import { createSelector } from 'reselect'
import {
  transformShapes,
  thetaRho
} from '../../common/Computer'

const getApp = state => state.app
const getShapes = state => state.shapes
const getTransforms = state => state.transforms
const getFile = state => state.file
const getGCode = state => state.gcode
const getMachine = state => state.machine

export const getVertices = createSelector(
  [
      getApp,
      getShapes,
      getTransforms,
      getFile,
      getGCode,
      getMachine,
  ],
  (app, shapes, transforms, file, gcode, machine) => {
    let state = {
      app: app,
      shapes: shapes,
      shape: shapes.byId[shapes.currentId],
      transforms: transforms,
      transform: transforms.byId[shapes.currentId],
      file: file,
      gcode: gcode,
      machine: machine
    }

    if (state.app.input === 'shape') {
      return transformShapes(state)
    } else if (state.app.input === 'code') {
      return thetaRho(state)
    } else {
      return transformShapes(state)
    }
  }
)

export const getVerticesStats = createSelector(
  [
      getVertices
  ],
  (vertices) => {
    let distance = 0.0
    var previous = null

    vertices.forEach( (vertex) => {
      if (previous) {
        distance += Math.sqrt(Math.pow(vertex.x - previous.x, 2.0) +
                              Math.pow(vertex.y - previous.y, 2.0))
      }
      previous = vertex
    })

    return {
      numPoints: vertices.length,
      distance: Math.floor(distance)
    }
  }
)
