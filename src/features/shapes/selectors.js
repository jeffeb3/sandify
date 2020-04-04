import { createSelector } from 'reselect'
import { registeredShapes } from '../../common/registeredShapes'

const getShapes = state => state.shapes
const getTransforms = state => state.transforms
const getCurrentShapeId = state => state.shapes.currentId

export const getShapesSelector = createSelector(
  [ getShapes ],
  shapes => shapes.allIds.map(id => shapes.byId[id])
)
export const getCurrentShapeSelector = createSelector(
  [ getCurrentShapeId, getShapes ],
  (id, shapes) => shapes.byId[id]
)

export const getCurrentTransformSelector = createSelector(
  [ getCurrentShapeId, getTransforms ],
  (id, transforms) => transforms.byId[id]
)

export const getShape = (shape) => {
  return registeredShapes[shape.type]
}

export const getShapeById = (id) => {
  return registeredShapes[id]
}
