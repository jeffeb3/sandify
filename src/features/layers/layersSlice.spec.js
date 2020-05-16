import layers, {
  addLayer,
  restoreDefaults,
  setCurrentLayer,
  setShapeType,
  updateLayer,
  toggleSpin,
  toggleGrow,
  toggleRepeat,
  toggleTrack,
  toggleTrackGrow,
} from './layersSlice'

describe('layers reducer', () => {
  const initialState = {
    circleLobes: 1,
    type: 'circle',
    repeatEnabled: true,
    canTransform: true,
    selectGroup: 'Shapes',
    shouldCache: true,
    canChangeSize: true,
    startingSize: 10,
    offsetX: 0.0,
    offsetY: 0.0,
    rotation: 0,
    numLoops: 10,
    transformMethod: 'smear',
    growEnabled: true,
    growValue: 100,
    growMethod: 'constant',
    growMath: 'i+cos(i/2)',
    spinEnabled: false,
    spinValue: 2,
    spinMethod: 'constant',
    spinMath: '10*sin(i/4)',
    spinSwitchbacks: 0,
    trackEnabled: false,
    trackGrowEnabled: false,
    trackValue: 10,
    trackLength: 0.2,
    trackNumLoops: 1,
    trackGrow: 50.0
  }

  it('should handle initial state', () => {
    expect(layers(undefined, {})).toEqual({
      current: null,
      selected: null,
      byId: {},
      allIds: []
    })
  })

  it('should handle addLayer', () => {
    expect(
      layers(
        {
          byId: {},
          allIds: []
        },
        addLayer({
          name: 'foo'
        })
      )
    ).toEqual({
      byId: {
        'layer1': {
          id: 'layer1',
          name: 'foo'
        }
      },
      allIds: ['layer1'],
    })
  })

  it('should handle restoreDefaults', () => {
    expect(
      layers(
        {
          byId: {
            'layer1': {
              id: 'layer1',
              type: 'circle',
              circleLobes: '2',
              polygonSides: '5'
            }
          }
        },
        restoreDefaults('layer1')
      )
    ).toEqual({
      byId: {
        'layer1': {
          id: 'layer1',
          ...initialState
        }
      }
    })
  })

  it('should handle setCurrentLayer', () => {
    expect(
      layers(
        {
          byId: {
            'layer2': {
              id: 'layer2'
            }
          },
          allIds: ['layer1', 'layer2']
        },
        setCurrentLayer(1)
      )
    ).toEqual({
      byId: {
        'layer2': {
          id: 'layer2'
        }
      },
      allIds: ['layer1', 'layer2'],
      current: 'layer2',
      selected: 'layer2'
    })
  })

  describe('setShapeType', () => {
    it('should add default values', () => {
      expect(
        layers(
          {
            byId: {
              'layer1': {
                id: 'layer1'
              }
            }
          },
          setShapeType({id: 'layer1', type: 'circle'})
        )
      ).toEqual({
        byId: {
          'layer1': {
            id: 'layer1',
            ...initialState
          }
        }
      })
    })

    it('should not override values if provided', () => {
      expect(
        layers(
          {
            byId: {
              'layer1': {
                id: 'layer1',
                circleLobes: 2
              }
            }
          },
          setShapeType({id: 'layer1', type: 'circle'})
        )
      ).toEqual({
        byId: {
          'layer1': {
            id: 'layer1',
            ...initialState,
            circleLobes: 2
          }
        }
      })
    })

    it('should always override values of protected attributes', () => {
      expect(
        layers(
          {
            byId: {
              'layer1': {
                id: 'layer1',
                repeatEnabled: false,
                canChangeSize: false
              }
            }
          },
          setShapeType({id: 'layer1', type: 'circle'})
        )
      ).toEqual({
        byId: {
          'layer1': {
            id: 'layer1',
            ...initialState,
          }
        }
      })
    })
  })

  it('should handle updateLayer', () => {
    expect(
      layers(
        {
          byId: {
            '1': {
              id: '1',
              name: 'foo'
            }
          }
        },
        updateLayer({id: '1', name: 'bar'})
      )
    ).toEqual({
      byId: {
        '1': {
          id: '1',
          name: 'bar'
        }
      }
    })
  })

  it('should handle toggleGrow', () => {
    expect(
      layers(
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
      layers(
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
      layers(
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
      layers(
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
      layers(
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
