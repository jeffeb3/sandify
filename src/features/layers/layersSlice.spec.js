import configureMockStore from "redux-mock-store"
import { thunk } from "redux-thunk"
import { resetUniqueId } from "@/common/mocks"
import { configureStore } from "@reduxjs/toolkit"
import layersReducer, {
  layersActions,
  addLayer,
  addLayerWithImage,
  addLayerWithRandomValues,
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
  setSelectedLayer,
  updateLayer,
  selectLayerVertices,
} from "./layersSlice"
import effectsReducer, { updateEffect } from "@/features/effects/effectsSlice"
import machinesReducer from "@/features/machines/machinesSlice"
import fontsReducer from "@/features/fonts/fontsSlice"
import imagesReducer from "@/features/images/imagesSlice"
import EffectLayer from "@/features/effects/EffectLayer"
import Layer from "./Layer"

const middleware = [thunk]
const mockStore = configureMockStore(middleware)

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
    polygonState.id = "2" // default machine is "1"

    expect(layersReducer(undefined, {})).toEqual({
      ids: ["2"],
      entities: {
        2: polygonState,
      },
      current: "2",
      selected: "2",
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
          },
          layersActions.deleteLayer("1"),
        ),
      ).toEqual({
        entities: {},
        ids: [],
      })
    })

    describe("should handle addEffect", () => {
      it("should add to end if no afterId specified", () => {
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

      it("should add at a specified afterId", () => {
        expect(
          layersReducer(
            {
              entities: {
                0: {
                  id: "0",
                  name: "foo",
                  effectIds: ["1", "2"],
                },
              },
              ids: ["0"],
            },
            layersActions.addEffect({
              id: "0",
              effectId: "3",
              afterId: "1",
            }),
          ),
        ).toEqual({
          entities: {
            0: {
              id: "0",
              name: "foo",
              effectIds: ["1", "3", "2"],
            },
          },
          ids: ["0"],
        })
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
                effectIds: [],
              },
            },
          },
          restoreDefaults({ id: "0" }),
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
                type: "circle",
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
            type: "circle",
          },
        },
      })
    })
  })

  it("should handle setSelectedLayer", () => {
    expect(
      layersReducer(
        {
          entities: {
            0: {},
            1: {},
          },
          selected: "1",
        },
        setSelectedLayer("0"),
      ),
    ).toEqual({
      entities: {
        0: {},
        1: {},
      },
      selected: "0",
    })
  })

  describe("compound actions", () => {
    describe("addEffect", () => {
      it("should dispatch actions to create an effect and then add it to the layer", async () => {
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
            entities: {},
            ids: [],
          },
        })
        const effect = {
          name: "foo",
        }

        store.dispatch(addEffect({ id: "0", effect, randomize: true }))
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

        expect(actions[2].type).toEqual("effects/randomizeValues")
        expect(actions[3].type).toEqual("effects/setCurrentEffect")
      })
    })

    describe("deleteEffect", () => {
      it("should dispatch actions to remove the effect from the layer and then delete it", async () => {
        const store = mockStore({
          layers: {
            entities: {
              0: {
                id: "0",
                name: "foo",
                effectIds: ["1"],
              },
            },
            ids: ["0"],
            current: "0",
            selected: "0",
          },
          effects: {
            entities: {
              1: {
                id: "1",
              },
            },
            ids: ["1"],
            current: undefined,
            selected: "1",
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

      it("should dispatch actions to delete an image if present", async () => {
        const store = mockStore({
          layers: {
            entities: {
              0: {
                id: "0",
                name: "foo",
                imageId: "I",
                effectIds: [],
              },
            },
            ids: ["0"],
          },
        })

        store.dispatch(deleteLayer("0"))
        const actions = store.getActions()
        expect(actions[0].type).toEqual("images/deleteImage")
        expect(actions[1].type).toEqual("layers/deleteLayer")
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
        expect(actions[0].type).toEqual("layers/addLayer")
        expect(actions[1].type).toEqual("effects/addEffect")
        expect(actions[2].type).toEqual("layers/addEffect")
        expect(actions[3].type).toEqual("effects/setCurrentEffect")
        expect(actions[4].type).toEqual("layers/setCurrentLayer")
        expect(actions[5].type).toEqual("layers/setSelectedLayer")
        expect(actions[6].type).toEqual("effects/addEffect")
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
          current: "a",
        },
      })

      store.dispatch(setCurrentLayer("0"))

      const actions = store.getActions()
      expect(actions[0].type).toEqual("layers/setCurrentLayer")
      expect(actions[1].type).toEqual("effects/setCurrentEffect")
    })

    describe("addLayerWithImage", () => {
      it("should dispatch actions to create an image and then create a layer pointing to that image", async () => {
        const store = mockStore({
          layers: {
            entities: {},
            ids: [],
          },
          images: {
            entities: {},
            ids: [],
          },
        })

        store.dispatch(
          addLayerWithImage({
            layerProps: {
              name: "layer",
              machine: { type: "polar" },
            },
            image: { src: "SRC" },
          }),
        )
        const actions = store.getActions()

        expect(actions[0].type).toEqual("images/addImage")
        expect(actions[0].payload).toEqual({
          id: "1",
          src: "SRC",
        })
        expect(actions[0].meta.id).toEqual("1")
        expect(actions[1].type).toEqual("images/getImage/pending")
      })
    })

    describe("addLayerWithRandomValues", () => {
      it("should dispatch actions to create a layer and randomize its values", async () => {
        const store = mockStore({
          layers: {
            entities: {},
            ids: [],
          },
          images: {
            entities: {},
            ids: [],
          },
        })

        store.dispatch(
          addLayerWithRandomValues({
            layer: {
              name: "layer",
              type: "circle",
            },
            randomize: true,
          }),
        )
        const actions = store.getActions()

        expect(actions[0].type).toEqual("layers/addLayer")
        expect(actions[0].meta.id).toEqual("1")
        expect(actions[1].type).toEqual("layers/randomizeValues")
        expect(actions[1].payload).toEqual("1")
      })
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
  }

  describe("selectLayerVertices", () => {
    let store
    beforeEach(() => {
      store = configureStore({
        reducer: {
          effects: effectsReducer,
          layers: layersReducer,
          machines: machinesReducer,
          fonts: fontsReducer,
          images: imagesReducer,
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
