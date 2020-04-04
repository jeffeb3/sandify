import shapes, {
  addShape,
  setCurrentShape,
  updateShape
} from './shapesSlice'

describe('shapes reducer', () => {
  it('should handle initial state', () => {
    expect(shapes(undefined, {})).toEqual({
      currentId: null,
      byId: {},
      allIds: []
    })
  })

  it('should handle addShape', () => {
    expect(
      shapes(
        {
          byId: {},
          allIds: []
        },
        addShape({
          id: '1'
        })
      )
    ).toEqual({
      byId: {
        '1': {
          id: '1'
        }
      },
      allIds: ['1'],
    })
  })

  it('should handle setCurrentShape', () => {
    expect(
      shapes(
        {
          currentId: 'circle'
        },
        setCurrentShape('polygon')
      )
    ).toEqual({
      currentId: 'polygon'
    })
  })

  it('should handle updateShape', () => {
    expect(
      shapes(
        {
          byId: {
            '1': {
              id: '1',
              circleLobes: 1
            }
          }
        },
        updateShape({id: '1', circleLobes: 2})
      )
    ).toEqual({
      byId: {
        '1': {
          id: '1',
          circleLobes: 2
        }
      }
    })
  })
})
