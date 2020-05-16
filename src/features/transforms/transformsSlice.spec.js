import transforms, {
  addTransform,
  updateTransform,
  toggleSpin,
  toggleGrow,
  toggleTrack,
  toggleTrackGrow,
} from './transformsSlice'

describe('transforms reducer', () => {
  it('should handle initial state', () => {
    expect(transforms(undefined, {})).toEqual({
      byId: {},
      allIds: []
    })
  })

  it('should handle addTransform', () => {
    expect(
      transforms(
        {
          byId: {},
          allIds: []
        },
        addTransform({
          id: '1'
        })
      )
    ).toEqual({
      byId: {
        '1': {
          id: '1',
          startingSize: 10,
          offsetX: 0,
          offsetY: 0,
          rotation: 0,
          numLoops: 10,
          repeatEnabled: true,
          growMethod: 'constant',
          growEnabled: true,
          growMathInput: "i+cos(i/2)",
          growMath: "i+cos(i/2)",
          growValue: 100,
          spinMethod: 'constant',
          spinEnabled: false,
          spinMathInput: "10*sin(i/4)",
          spinMath: "10*sin(i/4)",
          spinValue: 2,
          spinSwitchbacks: 0,
          trackEnabled: false,
          trackGrowEnabled: false,
          trackValue: 10,
          trackLength: 0.2,
          trackNumLoops: 1,
          transformMethod: 'smear',
          trackGrow: 50.0
        }
      },
      allIds: ['1'],
    })
  })

  it('should handle updateTransform', () => {
    expect(
      transforms(
        {
          byId: {
            '1': {
              id: '1',
              offsetX: 0.0
            }
          }
        },
        updateTransform({id: '1', offsetX: 20.0})
      )
    ).toEqual({
      byId: {
        '1': {
          id: '1',
          offsetX: 20.0
        }
      }
    })
  })

  it('should handle toggleGrow', () => {
    expect(
      transforms(
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
      transforms(
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

  it('should handle toggleTrack', () => {
    expect(
      transforms(
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
      transforms(
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
