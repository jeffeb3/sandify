import layers, {
  addLayer,
  copyLayer,
  moveLayer,
  restoreDefaults,
  setCurrentLayer,
  setSelectedLayer,
  setNewLayerType,
  setShapeType,
  updateLayer,
  toggleSpin,
  toggleGrow,
  toggleRepeat,
  toggleTrack,
  toggleTrackGrow,
  toggleVisible
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
    reverse: false,
    transformMethod: 'smear',
    growEnabled: true,
    growValue: 100,
    growMethod: 'constant',
    growMath: 'i+cos(i/2)',
    growMathInput: 'i+cos(i/2)',
    spinEnabled: false,
    spinValue: 2,
    spinMethod: 'constant',
    spinMath: '10*sin(i/4)',
    spinMathInput: '10*sin(i/4)',
    spinSwitchbacks: 0,
    trackEnabled: false,
    trackGrowEnabled: false,
    trackValue: 10,
    trackLength: 0.2,
    trackNumLoops: 1,
    trackGrow: 50.0,
    usesMachine: false,
    dragging: false,
    visible: true
  }

  it('should handle initial state', () => {
    expect(layers(undefined, {})).toEqual({
      current: null,
      selected: null,
      newLayerType: 'polygon',
      newLayerName: 'polygon',
      newLayerNameOverride: false,
      copyLayerName: null,
      byId: {},
      allIds: []
    })
  })

  it('should handle addLayer', () => {
    expect(
      layers({
        byId: {},
        allIds: []
      },
      addLayer({
        name: 'foo'
      }))
    ).toEqual({
      byId: {
        'layer-1': {
          id: 'layer-1',
          name: 'foo'
        }
      },
      allIds: ['layer-1'],
      current: 'layer-1',
      selected: 'layer-1',
      newLayerName: undefined,
      newLayerNameOverride: false
    })
  })

  it('should handle copyLayer', () => {
    expect(
      layers({
        byId: {
          'layer-1': {
            id: 'layer-1',
            name: 'foo'
          }
        },
        allIds: ['layer-1'],
        copyLayerName: 'foo'
      },
      copyLayer('layer-1'))
    ).toEqual({
      byId: {
        'layer-1': {
          id: 'layer-1',
          name: 'foo'
        },
        'layer-2': {
          id: 'layer-2',
          name: 'foo'
        }
      },
      allIds: ['layer-1', 'layer-2'],
      current: 'layer-2',
      selected: 'layer-2',
      copyLayerName: 'foo'
    })
  })

  it('should handle moveLayer', () => {
    expect(
      layers(
        {
          allIds: ['a', 'b', 'c', 'd', 'e']
        },
        moveLayer({oldIndex: 0, newIndex: 2})
      )
    ).toEqual({
      allIds: ['b', 'c', 'a', 'd', 'e'],
    })
  })

  it('should handle restoreDefaults', () => {
    expect(
      layers(
        {
          byId: {
            'layer-1': {
              id: 'layer-1',
              name: 'foo',
              type: 'circle',
              circleLobes: '2',
              polygonSides: '5'
            }
          }
        },
        restoreDefaults('layer-1')
      )
    ).toEqual({
      byId: {
        'layer-1': {
          id: 'layer-1',
          name: 'foo',
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
            'layer-2': {
              id: 'layer-2'
            }
          },
          allIds: ['layer-1', 'layer-2']
        },
        setCurrentLayer('layer-2')
      )
    ).toEqual({
      byId: {
        'layer-2': {
          id: 'layer-2'
        }
      },
      allIds: ['layer-1', 'layer-2'],
      current: 'layer-2',
      selected: 'layer-2'
    })
  })

  it('should handle setSelectedLayer', () => {
    expect(
      layers(
        {
          byId: {
            'layer-2': {
              id: 'layer-2'
            }
          },
          allIds: ['layer-1', 'layer-2']
        },
        setSelectedLayer('layer-2')
      )
    ).toEqual({
      byId: {
        'layer-2': {
          id: 'layer-2'
        }
      },
      allIds: ['layer-1', 'layer-2'],
      selected: 'layer-2'
    })
  })

  describe('setShapeType', () => {
    it('should add default values', () => {
      expect(
        layers(
          {
            byId: {
              'layer-1': {
                id: 'layer-1'
              }
            }
          },
          setShapeType({id: 'layer-1', type: 'circle'})
        )
      ).toEqual({
        byId: {
          'layer-1': {
            id: 'layer-1',
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
              'layer-1': {
                id: 'layer-1',
                circleLobes: 2
              }
            }
          },
          setShapeType({id: 'layer-1', type: 'circle'})
        )
      ).toEqual({
        byId: {
          'layer-1': {
            id: 'layer-1',
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
              'layer-1': {
                id: 'layer-1',
                repeatEnabled: false,
                canChangeSize: false
              }
            }
          },
          setShapeType({id: 'layer-1', type: 'circle'})
        )
      ).toEqual({
        byId: {
          'layer-1': {
            id: 'layer-1',
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

  it('should handle toggleToggleVisible', () => {
    expect(
      layers(
        {
          byId: {
            '1': {
              visible: true
            }
          }
        },
        toggleVisible({id: '1'})
      )
    ).toEqual({
      byId: {
        '1': {
          visible: false
        }
      }
    })
  })

  it('should handle setNewLayerType', () => {
    expect(
      layers(
        {
          newLayerType: 'circle'
        },
        setNewLayerType('polygon')
      )
    ).toEqual({
      newLayerType: 'polygon',
      newLayerName: 'polygon'
    })
  })
})
