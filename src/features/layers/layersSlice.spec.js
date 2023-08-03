import configureMockStore from "redux-mock-store"
import thunk from "redux-thunk"
import { resetUniqueId } from "@/common/mocks"
import layers, {
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
} from "./layersSlice"
import Layer from "./Layer"

const mockStore = configureMockStore([thunk])

beforeEach(() => {
  resetUniqueId()
})

describe("layers reducer", () => {
  const circleState = new Layer("circle").getInitialState()

  it("should handle initial state", () => {
    const polygonState = new Layer("polygon").getInitialState()
    polygonState.id = "1"

    expect(layers(undefined, {})).toEqual({
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
        layers(
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
        layers(
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
        layers(
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
        layers(
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
        layers(
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
          layers(
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
          layers(
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
        layers(
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
        layers(
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

    it("should handle setCurrentLayer", () => {
      expect(
        layers(
          {
            entities: {
              0: {},
              1: {},
            },
            current: "0",
          },
          setCurrentLayer("1"),
        ),
      ).toEqual({
        entities: {
          0: {},
          1: {},
        },
        current: "1",
        selected: "1",
      })
    })

    it("should handle updateLayer", () => {
      expect(
        layers(
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
        expect(actions[0].meta.id).toEqual("1")
        expect(actions[1].type).toEqual("layers/addEffect")
        expect(actions[1].payload).toEqual({ id: "0", effectId: "1" })
      })
    })

    describe("deleteEffect", () => {
      it("should dispatch actions to remove the effect from the layer and then delete it", async () => {
        const store = mockStore()

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
  })
})
