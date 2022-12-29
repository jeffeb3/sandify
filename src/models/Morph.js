import { rotate, offset, scale } from '@/common/geometry'

export const morphOptions = {
  startingWidth: {
    title: 'Initial width',
    min: 1,
    isVisible: (model) => { return model.canChangeSize },
    onChange: (changes, model) => {
      if (!model.canChangeHeight) {
        changes.startingHeight = changes.startingWidth
      }
      return changes
    }
  },
  startingHeight: {
    title: 'Initial height',
    min: 1,
    isVisible: (model) => { return model.canChangeSize && model.canChangeHeight },
  },
  offsetX: {
    title: 'X offset',
    isVisible: (model) => { return model.canMove }
  },
  offsetY: {
    title: 'Y offset',
    isVisible: (model) => { return model.canMove }
  },
  rotation: {
    title: 'Rotate (degrees)',
    isVisible: (model) => { return model.canRotate }
  },
}

export const initialMorphState = () => {
    return {
      startingWidth: 10,
      startingHeight: 10,
      offsetX: 0.0,
      offsetY: 0.0,
      rotation: 0,
    }
  }

export const morphVertices = (state, shapeVertices) => {
  const { startingWidth, startingHeight, offsetX, offsetY, rotation } = state
  return shapeVertices.map(vertex => {
    return rotate(offset(scale(vertex, startingWidth, startingHeight), offsetX, offsetY), rotation)
  })
}
