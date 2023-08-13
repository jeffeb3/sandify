import configureMockStore from "redux-mock-store"
import thunk from "redux-thunk"
import { resetUniqueId } from "@/common/mocks"
import { configureStore } from "@reduxjs/toolkit"
import layersReducer, {
  layersActions,
  addLayer,
  addEffect,
  changeModelType,
  deleteLayer,
  removeEffect,
  deleteEffect,
  copyLayer,
  moveEffect,
  moveLayer,
  restoreDefaults,
  setCurrentLayer,
  updateLayer,
  selectLayerVertices,
} from "./layersSlice"
import effectsReducer, { updateEffect } from "@/features/effects/effectsSlice"
import machineReducer from "@/features/machine/machineSlice"
import EffectLayer from "@/features/effects/EffectLayer"
import Layer from "./Layer"

const mockStore = configureMockStore([thunk])

beforeEach(() => {
  resetUniqueId()
})

// ------------------------------
// Slice, reducers and atomic actions
// ------------------------------

const polygonState = new Layer("polygon").getInitialState()
const loopEffectState = new EffectLayer("loop").getInitialState()

describe("layers reducer", () => {
  const circleState = new Layer("circle").getInitialState()

  it("should handle initial state", () => {
    polygonState.id = "1"

    expect(layersReducer(undefined, {})).toEqual({
      ids: ["1"],
      entities: {
        1: polygonState,
      },
      current: "1",
      selected: "1",
    })
  })

  describe("atomic actions", () => {
    it("should handle addLayer", () => {
      expect(
        layersReducer(
          {
            ids: [],
            entities: {},
          },
          addLayer({
            name: "foo",
          }),
        ),
      ).toEqual({
        ids: ["1"],
        entities: {
          1: {
            id: "1",
            name: "foo",
            effectIds: [],
          },
        },
        current: "1",
        selected: "1",
      })
    })

    describe("should handle deleteLayer", () => {
      expect(
        layersReducer(
          {
            entities: {
              1: {
                id: "1",
                name: "foo",
              },
            },
            ids: ["1"],
            current: "1",
          },
          layersActions.deleteLayer("1"),
        ),
      ).toEqual({
        entities: {},
        ids: [],
        current: undefined,
      })
    })

    it("should handle addEffect", () => {
      expect(
        layersReducer(
          {
            entities: {
              0: {
                id: "0",
                name: "foo",
                effectIds: [],
              },
            },
            ids: ["0"],
          },
          layersActions.addEffect({
            id: "0",
            effectId: "1",
          }),
        ),
      ).toEqual({
        entities: {
          0: {
            id: "0",
            name: "foo",
            effectIds: ["1"],
          },
        },
        ids: ["0"],
      })
    })

    it("should handle moveEffect", () => {
      expect(
        layersReducer(
          {
            entities: {
              0: {
                id: "0",
                name: "foo",
                effectIds: ["1", "2", "3"],
              },
            },
          },
          moveEffect({ id: "0", oldIndex: 0, newIndex: 1 }),
        ),
      ).toEqual({
        entities: {
          0: {
            id: "0",
            name: "foo",
            effectIds: ["2", "1", "3"],
          },
        },
      })
    })

    it("should handle removeEffect", () => {
      expect(
        layersReducer(
          {
            entities: {
              0: {
                id: "0",
                effectIds: ["1"],
              },
            },
            ids: ["0"],
          },
          removeEffect({
            id: "0",
            effectId: "1",
          }),
        ),
      ).toEqual({
        entities: {
          0: {
            id: "0",
            effectIds: [],
          },
        },
        ids: ["0"],
      })
    })

    describe("changeModelType", () => {
      it("should add default values", () => {
        expect(
          layersReducer(
            {
              entities: {
                0: {
                  id: "0",
                },
              },
            },
            changeModelType({ id: "0", type: "circle" }),
          ),
        ).toEqual({
          entities: {
            0: {
              id: "0",
              ...circleState,
            },
          },
        })
      })

      it("should not override values if provided", () => {
        expect(
          layersReducer(
            {
              entities: {
                0: {
                  id: "0",
                  circleLobes: 2,
                },
              },
            },
            changeModelType({ id: "0", type: "circle" }),
          ),
        ).toEqual({
          entities: {
            0: {
              id: "0",
              ...circleState,
              circleLobes: 2,
            },
          },
        })
      })
    })

    it("should handle moveLayer", () => {
      expect(
        layersReducer(
          {
            ids: ["a", "b", "c", "d", "e"],
          },
          moveLayer({ oldIndex: 0, newIndex: 2 }),
        ),
      ).toEqual({
        ids: ["b", "c", "a", "d", "e"],
      })
    })

    it("should handle restoreDefaults", () => {
      expect(
        layersReducer(
          {
            entities: {
              0: {
                id: "0",
                name: "foo",
                type: "circle",
                circleLobes: "2",
                polygonSides: "5",
              },
            },
          },
          restoreDefaults("0"),
        ),
      ).toEqual({
        entities: {
          0: {
            id: "0",
            name: "foo",
            ...circleState,
          },
        },
      })
    })

    it("should handle updateLayer", () => {
      expect(
        layersReducer(
          {
            entities: {
              1: {
                id: "1",
                name: "foo",
              },
            },
          },
          updateLayer({ id: "1", name: "bar" }),
        ),
      ).toEqual({
        entities: {
          1: {
            id: "1",
            name: "bar",
          },
        },
      })
    })
  })

  describe("compound actions", () => {
    describe("addEffect", () => {
      it("should dispatch actions to create an effect and then add it to the layer", async () => {
        const store = mockStore()
        const effect = {
          name: "foo",
        }

        store.dispatch(addEffect({ id: "0", effect }))
        const actions = store.getActions()
        expect(actions[0].type).toEqual("effects/addEffect")
        expect(actions[0].payload).toEqual({
          id: "1",
          layerId: "0",
          name: "foo",
        })
        expect(actions[0].meta.id).toEqual("1")
        expect(actions[1].type).toEqual("layers/addEffect")
        expect(actions[1].payload).toEqual({ id: "0", effectId: "1" })
      })
    })

    describe("deleteEffect", () => {
      it("should dispatch actions to remove the effect from the layer and then delete it", async () => {
        const store = mockStore({
          layers: {
            entities: {
              "0": {
                id: "0",
                name: "foo",
                effectIds: ["1", "2"],
              },
            },
            ids: ["0"],
            current: "0",
          },
        })

        store.dispatch(deleteEffect({ id: "0", effectId: "1" }))
        const actions = store.getActions()
        expect(actions[0].type).toEqual("layers/removeEffect")
        expect(actions[0].payload).toEqual({ id: "0", effectId: "1" })
        expect(actions[1].type).toEqual("effects/deleteEffect")
        expect(actions[1].payload).toEqual("1")
      })
    })

    describe("deleteLayer", () => {
      it("should dispatch actions to delete the layer and then delete its effects", async () => {
        const store = mockStore({
          layers: {
            entities: {
              0: {
                id: "0",
                name: "foo",
                effectIds: ["1", "2"],
              },
            },
            ids: ["0"],
          },
        })

        store.dispatch(deleteLayer("0"))
        const actions = store.getActions()
        expect(actions[0].type).toEqual("effects/deleteEffect")
        expect(actions[1].type).toEqual("effects/deleteEffect")
        expect(actions[2].type).toEqual("layers/deleteLayer")
      })
    })

    describe("copyLayer", () => {
      it("should dispatch actions copy the layer and its effects", async () => {
        const store = mockStore({
          layers: {
            entities: {
              0: {
                id: "0",
                name: "foo",
                effectIds: ["a", "b"],
              },
            },
            ids: ["0"],
          },
          effects: {
            entities: {
              a: {
                id: "a",
              },
              b: {
                id: "b",
              },
            },
            ids: ["a", "b"],
          },
        })

        store.dispatch(
          copyLayer({
            id: "0",
            name: "bar",
          }),
        )
        const actions = store.getActions()
        expect(actions[0].type).toEqual("effects/addEffect")
        expect(actions[1].type).toEqual("effects/addEffect")
        expect(actions[2].type).toEqual("layers/addLayer")
        expect(actions[2].payload).toEqual({
          id: "3",
          name: "bar",
          effectIds: ["1", "2"],
        })
      })
    })

    it("should handle setCurrentLayer", () => {
      const store = mockStore({
        layers: {
          entities: {
            0: {
              id: "0",
              name: "foo",
              effectIds: ["a", "b"],
            },
          },
          ids: ["0"],
          selected: "0",
          current: null,
        },
        effects: {
          entities: {
            a: {
              id: "a",
            },
            b: {
              id: "b",
            },
          },
          ids: ["a", "b"],
          selected: "a",
          current: "a"
        },
      })

      store.dispatch(
        setCurrentLayer("0"),
      )

      const actions = store.getActions()
      expect(actions[0].type).toEqual("layers/setCurrentLayer")
      expect(actions[1].type).toEqual("effects/setCurrentEffect")
    })
  })
})

// ------------------------------
// Selectors
// ------------------------------
describe("layers selectors", () => {
  const initialState = {
    layers: {
      ids: ["A", "B"],
      entities: {
        A: { ...polygonState, id: "A", name: "A", effectIds: ["1", "3"] },
        B: { ...polygonState, id: "B", name: "B", effectIds: ["2"] },
      },
    },
    effects: {
      ids: ["1", "2", "3"],
      entities: {
        1: { id: "1", layerId: "A", ...loopEffectState },
        2: { id: "2", layerId: "B", ...loopEffectState },
        3: { id: "3", layerId: "A", ...loopEffectState },
      },
    },
    machine: {},
  }

  describe("selectLayerVertices", () => {
    let store
    beforeEach(() => {
      store = configureStore({
        reducer: {
          effects: effectsReducer,
          layers: layersReducer,
          machine: machineReducer,
        },
        preloadedState: initialState,
      })
      resetUniqueId(3)
      selectLayerVertices.resetRecomputations()
    })

    it("should recompute when layer changes", () => {
      selectLayerVertices(store.getState(), "A")
      store.dispatch(updateLayer({ id: "A", foo: "bar" }))
      selectLayerVertices(store.getState(), "A")

      expect(selectLayerVertices.recomputations()).toBe(2)
    })

    it("should recompute when adding new effect", () => {
      selectLayerVertices(store.getState(), "A")
      store.dispatch(addEffect({ id: "A", effect: { name: "bar" } }))
      selectLayerVertices(store.getState(), "A")

      expect(selectLayerVertices.recomputations()).toBe(2)
    })

    it("should recompute when layer effect changes", () => {
      selectLayerVertices(store.getState(), "A")
      expect(selectLayerVertices.recomputations()).toBe(1)
      store.dispatch(updateEffect({ id: "1", foo: "bar" }))
      store.dispatch(updateEffect({ id: "1", foo: "bar" })) // equivalent
      selectLayerVertices(store.getState(), "A")

      expect(selectLayerVertices.recomputations()).toBe(2)
    })
  })
})
