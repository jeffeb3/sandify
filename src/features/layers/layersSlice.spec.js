jest.mock('lodash/uniqueId')
const uniqueId = require('lodash/uniqueId')
import mockUniqueId, { resetUniqueIds } from '../../common/mocks'
import layers, {
  addLayer,
  removeLayer,
  copyLayer,
  moveLayer,
  restoreDefaults,
  addEffect,
  removeEffect,
  moveEffect,
  setCurrentLayer,
  setSelectedLayer,
  setNewLayerType,
  setNewEffectType,
  setShapeType,
  updateLayer,
  toggleSpin,
  toggleGrow,
  toggleOpen,
  toggleRepeat,
  toggleTrack,
  toggleTrackGrow,
  toggleVisible
} from './layersSlice'

beforeEach(() => {
  resetUniqueIds()
  uniqueId.mockImplementation((prefix) => mockUniqueId(prefix))
})

describe('layers reducer', () => {
  const initialState = {
    circleLobes: 1,
    circleDirection: 'clockwise',
    type: 'circle',
    repeatEnabled: true,
    canTransform: true,
    selectGroup: 'Shapes',
    shouldCache: true,
    canRotate: true,
    canChangeSize: true,
    canChangeHeight: true,
    canMove: true,
    autosize: true,
    startingWidth: 10,
    startingHeight: 10,
    offsetX: 0.0,
    offsetY: 0.0,
    open: true,
    rotation: 0,
    numLoops: 10,
    reverse: false,
    transformMethod: 'smear',
    connectionMethod: 'line',
    backtrackPct: 0,
    drawPortionPct: 100,
    effect: false,
    rotateStartingPct: 0,
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
    usesFonts: false,
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
      newEffectNameOverride: false,
      newEffectName: 'mask',
      newEffectType: 'mask',
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
      newLayerName: 'foo',
      newLayerNameOverride: false
    })
  })

  describe('removeLayer', () => {
    it('should remove layer', () => {
      expect(
        layers({
          byId: {
            'layer-1': {
              id: 'layer-1',
              name: 'foo'
            }
          },
          allIds: ['layer-1'],
          current: 'layer-1',
          copyLayerName: 'foo'
        },
        removeLayer('layer-1'))
      ).toEqual({
        byId: {},
        allIds: [],
        current: undefined,
        selected: undefined,
        copyLayerName: 'foo'
      })
    })

    it('should remove effects associated with layer', () => {
      expect(
        layers({
          byId: {
            'layer': {
              id: 'layer',
              name: 'foo',
              effectIds: ['effect']
            },
            'effect': {
              id: 'effect',
              name: 'bar',
              parentId: 'layer'
            }
          },
          allIds: ['layer'],
          current: 'layer',
          copyLayerName: 'foo'
        },
        removeLayer('layer'))
      ).toEqual({
        byId: {},
        allIds: [],
        current: undefined,
        selected: undefined,
        copyLayerName: 'foo'
      })
    })
  })

  describe('copyLayer', () => {
    it('should copy layer', () => {
      expect(
        layers({
          byId: {
            'layer-0': {
              id: 'layer-0',
              name: 'foo'
            }
          },
          allIds: ['layer-0'],
          current: 'layer-0',
          copyLayerName: 'foo'
        },
        copyLayer('layer-0'))
      ).toEqual({
        byId: {
          'layer-0': {
            id: 'layer-0',
            name: 'foo'
          },
          'layer-1': {
            id: 'layer-1',
            name: 'foo'
          }
        },
        allIds: ['layer-0', 'layer-1'],
        current: 'layer-1',
        selected: 'layer-1',
        copyLayerName: 'foo'
      })
    })

    it('should copy effects', () => {
      expect(
        layers({
          byId: {
            'layer': {
              id: 'layer',
              name: 'foo',
              effectIds: ['effect']
            },
            'effect': {
              id: 'effect',
              name: 'bar',
              parentId: 'layer'
            }
          },
          allIds: ['layer'],
          current: 'layer',
          copyLayerName: 'foo'
        },
        copyLayer('layer'))
      ).toEqual({
        byId: {
          'layer': {
            id: 'layer',
            name: 'foo',
            effectIds: ['effect']
          },
          'effect': {
            id: 'effect',
            name: 'bar',
            parentId: 'layer'
          },
          'layer-1': {
            id: 'layer-1',
            name: 'foo',
            effectIds: ['layer-2']
          },
          'layer-2': {
            id: 'layer-2',
            name: 'bar',
            parentId: 'layer-1'
          },
        },
        allIds: ['layer', 'layer-1'],
        current: 'layer-1',
        selected: 'layer-1',
        copyLayerName: 'foo'
      })
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

  describe('addEffect', () => {
    it('when no parent layer, does nothing', () => {
      const state = {
        byId: {
          'layer-1': {
            id: 'layer-1',
            name: 'foo'
          }
        },
      }
      expect(
        layers(state,
        addEffect({
          name: 'bar'
        }))
      ).toEqual(state)
    })

    it('adds effect', () => {
      expect(
        layers({
          byId: {
            'layer': {
              id: 'layer',
              name: 'foo'
            }
          },
          allIds: ['layer'],
          current: 'layer'
        },
        addEffect({
          name: 'bar',
          parentId: 'layer'
        }))
      ).toEqual({
        byId: {
          'layer': {
            id: 'layer',
            name: 'foo',
            open: true,
            effectIds: ['layer-1']
          },
          'layer-1': {
            id: 'layer-1',
            name: 'bar',
            parentId: 'layer'
          }
        },
        allIds: ['layer'],
        current: 'layer-1',
        selected: 'layer-1'
      })
    })
  })

  it('should handle removeEffect', () => {
    expect(
      layers({
        byId: {
          'layer-1': {
            id: 'layer-1',
            name: 'foo',
            effectIds: ['layer-2']
          },
          'layer-2': {
            id: 'layer-2',
            name: 'bar',
            parentId: 'layer-1'
          },
        },
        allIds: ['layer-1'],
        current: 'layer-2',
      },
      removeEffect('layer-2'))
    ).toEqual({
      byId: {
        'layer-1': {
          id: 'layer-1',
          name: 'foo',
          effectIds: []
        },
      },
      allIds: ['layer-1'],
      current: 'layer-1',
      selected: 'layer-1'
    })
  })

  it('should handle moveEffect', () => {
    expect(
      layers(
        {
          byId: {
            'layer-1': {
              id: 'layer-1',
              name: 'foo',
              effectIds: ['layer-2', 'layer-3']
            },
            'layer-2': {
              id: 'layer-2',
              name: 'bar',
              parentId: 'layer-1'
            },
            'layer-3': {
              id: 'layer-3',
              name: 'moo',
              parentId: 'layer-1'
            },
          },
          allIds: ['layer-1']
        },
        moveEffect({parentId: 'layer-1', oldIndex: 0, newIndex: 1})
      )
    ).toEqual({
      byId: {
        'layer-1': {
          id: 'layer-1',
          name: 'foo',
          effectIds: ['layer-3', 'layer-2']
        },
        'layer-2': {
          id: 'layer-2',
          name: 'bar',
          parentId: 'layer-1'
        },
        'layer-3': {
          id: 'layer-3',
          name: 'moo',
          parentId: 'layer-1'
        },
      },
      allIds: ['layer-1']
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

  it('should handle toggleVisible', () => {
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

  it('should handle toggleOpen', () => {
    expect(
      layers(
        {
          byId: {
            '1': {
              open: true
            }
          }
        },
        toggleOpen({id: '1'})
      )
    ).toEqual({
      byId: {
        '1': {
          open: false
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

  it('should handle setNewEffectType', () => {
    expect(
      layers(
        {
          newEffectType: 'mask'
        },
        setNewEffectType('noise')
      )
    ).toEqual({
      newEffectType: 'noise',
      newEffectName: 'noise'
    })
  })
})
