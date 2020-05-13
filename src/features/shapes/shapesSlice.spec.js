import shapes, {
  addShape,
  setCurrentShape,
  updateShape,
  toggleSpin,
  toggleGrow,
  toggleRepeat,
  toggleTrack,
  toggleTrackGrow,
} from './shapesSlice'

describe('shapes reducer', () => {
  it('should handle initial state', () => {
    expect(shapes(undefined, {})).toEqual({
      currentId: null,
      selectedId: null,
      byId: {},
      allIds: [],
      layerIds: []
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
      currentId: 'polygon',
      selectedId: 'polygon'
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

  it('should handle toggleGrow', () => {
    expect(
      shapes(
        {
          byId: {
            '1': {
              growEnabled: false
            }
          }
        },
        toggleGrow({id: '1'})
      )
    ).toEqual({
      byId: {
        '1': {
          growEnabled: true
        }
      }
    })
  })

  it('should handle toggleSpin', () => {
    expect(
      shapes(
        {
          byId: {
            '1': {
              spinEnabled: false
            }
          }
        },
        toggleSpin({id: '1'})
      )
    ).toEqual({
      byId: {
        '1': {
          spinEnabled: true
        }
      }
    })
  })

  it('should handle toggleRepeat', () => {
    expect(
      shapes(
        {
          byId: {
            '1': {
              repeatEnabled: false
            }
          }
        },
        toggleRepeat({id: '1'})
      )
    ).toEqual({
      byId: {
        '1': {
          repeatEnabled: true
        }
      }
    })
  })

  it('should handle toggleTrack', () => {
    expect(
      shapes(
        {
          byId: {
            '1': {
              trackEnabled: false
            }
          }
        },
        toggleTrack({id: '1'})
      )
    ).toEqual({
      byId: {
        '1': {
          trackEnabled: true
        }
      }
    })
  })

  it('should handle toggleToggleGrow', () => {
    expect(
      shapes(
        {
          byId: {
            '1': {
              trackGrowEnabled: false
            }
          }
        },
        toggleTrackGrow({id: '1'})
      )
    ).toEqual({
      byId: {
        '1': {
          trackGrowEnabled: true
        }
      }
    })
  })
})
