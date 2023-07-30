import { resetUniqueId } from "@/common/mocks"
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
  changeModelType,
  updateLayer,
  toggleOpen,
  toggleVisible,
} from "./layersSlice"
import Layer from "./Layer"

beforeEach(() => {
  resetUniqueId()
})

describe("layers reducer", () => {
  const circleState = new Layer("circle").getInitialState()
  const polygonState = new Layer("polygon").getInitialState()
  polygonState.id = "1"

  it("should handle initial state", () => {
    expect(layers(undefined, {})).toEqual({
      current: "1",
      selected: "1",
      newEffectNameOverride: false,
      newEffectName: "mask",
      newEffectType: "mask",
      byId: {
        ["1"]: polygonState,
      },
      allIds: ["1"],
    })
  })

  it("should handle addLayer", () => {
    expect(
      layers(
        {
          byId: {},
          allIds: [],
        },
        addLayer({
          name: "foo",
        }),
      ),
    ).toEqual({
      byId: {
        1: {
          id: "1",
          name: "foo",
        },
      },
      allIds: ["1"],
      current: "1",
      selected: "1",
      newLayerName: "foo",
    })
  })

  describe("removeLayer", () => {
    it("should remove layer", () => {
      expect(
        layers(
          {
            byId: {
              1: {
                id: "1",
                name: "foo",
              },
            },
            allIds: ["1"],
            current: "1",
          },
          removeLayer("1"),
        ),
      ).toEqual({
        byId: {},
        allIds: [],
        current: undefined,
        selected: undefined,
      })
    })

    it("should remove effects associated with layer", () => {
      expect(
        layers(
          {
            byId: {
              layer: {
                id: "layer",
                name: "foo",
                effectIds: ["effect"],
              },
              effect: {
                id: "effect",
                name: "bar",
                parentId: "layer",
              },
            },
            allIds: ["layer"],
            current: "layer",
            copyLayerName: "foo",
          },
          removeLayer("layer"),
        ),
      ).toEqual({
        byId: {},
        allIds: [],
        current: undefined,
        selected: undefined,
        copyLayerName: "foo",
      })
    })
  })

  describe("copyLayer", () => {
    it("should copy layer", () => {
      expect(
        layers(
          {
            byId: {
              0: {
                id: "0",
                name: "foo",
              },
            },
            allIds: ["0"],
            current: "0",
          },
          copyLayer({
            id: "0",
            name: "bar",
          }),
        ),
      ).toEqual({
        byId: {
          0: {
            id: "0",
            name: "foo",
          },
          1: {
            id: "1",
            name: "bar",
          },
        },
        allIds: ["0", "1"],
        current: "1",
        selected: "1",
      })
    })

    it("should copy effects", () => {
      expect(
        layers(
          {
            byId: {
              0: {
                id: "0",
                name: "foo",
                effectIds: ["effect"],
              },
              effect: {
                id: "effect",
                name: "bar",
                parentId: "0",
              },
            },
            allIds: ["0"],
            current: "0",
          },
          copyLayer({
            id: "0",
            name: "foo copy",
          }),
        ),
      ).toEqual({
        byId: {
          0: {
            id: "0",
            name: "foo",
            effectIds: ["effect"],
          },
          effect: {
            id: "effect",
            name: "bar",
            parentId: "0",
          },
          1: {
            id: "1",
            name: "foo copy",
            effectIds: ["2"],
          },
          2: {
            id: "2",
            name: "bar",
            parentId: "1",
          },
        },
        allIds: ["0", "1"],
        current: "1",
        selected: "1",
      })
    })
  })

  it("should handle moveLayer", () => {
    expect(
      layers(
        {
          allIds: ["a", "b", "c", "d", "e"],
        },
        moveLayer({ oldIndex: 0, newIndex: 2 }),
      ),
    ).toEqual({
      allIds: ["b", "c", "a", "d", "e"],
    })
  })

  it("should handle restoreDefaults", () => {
    expect(
      layers(
        {
          byId: {
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
      byId: {
        0: {
          id: "0",
          name: "foo",
          ...circleState,
        },
      },
    })
  })

  describe("addEffect", () => {
    it("when no parent layer, does nothing", () => {
      const state = {
        byId: {
          "layer-1": {
            id: "layer-1",
            name: "foo",
          },
        },
      }
      expect(
        layers(
          state,
          addEffect({
            name: "bar",
          }),
        ),
      ).toEqual(state)
    })

    it("adds effect", () => {
      expect(
        layers(
          {
            byId: {
              0: {
                id: "0",
                name: "foo",
              },
            },
            allIds: ["0"],
            current: "0",
          },
          addEffect({
            name: "bar",
            parentId: "0",
          }),
        ),
      ).toEqual({
        byId: {
          0: {
            id: "0",
            name: "foo",
            open: true,
            effectIds: ["1"],
          },
          1: {
            id: "1",
            name: "bar",
            parentId: "0",
          },
        },
        allIds: ["0"],
        current: "1",
        selected: "1",
      })
    })
  })

  it("should handle removeEffect", () => {
    expect(
      layers(
        {
          byId: {
            "layer-1": {
              id: "layer-1",
              name: "foo",
              effectIds: ["layer-2"],
            },
            "layer-2": {
              id: "layer-2",
              name: "bar",
              parentId: "layer-1",
            },
          },
          allIds: ["layer-1"],
          current: "layer-2",
        },
        removeEffect("layer-2"),
      ),
    ).toEqual({
      byId: {
        "layer-1": {
          id: "layer-1",
          name: "foo",
          effectIds: [],
        },
      },
      allIds: ["layer-1"],
      current: "layer-1",
      selected: "layer-1",
    })
  })

  it("should handle moveEffect", () => {
    expect(
      layers(
        {
          byId: {
            "layer-1": {
              id: "layer-1",
              name: "foo",
              effectIds: ["layer-2", "layer-3"],
            },
            "layer-2": {
              id: "layer-2",
              name: "bar",
              parentId: "layer-1",
            },
            "layer-3": {
              id: "layer-3",
              name: "moo",
              parentId: "layer-1",
            },
          },
          allIds: ["layer-1"],
        },
        moveEffect({ parentId: "layer-1", oldIndex: 0, newIndex: 1 }),
      ),
    ).toEqual({
      byId: {
        "layer-1": {
          id: "layer-1",
          name: "foo",
          effectIds: ["layer-3", "layer-2"],
        },
        "layer-2": {
          id: "layer-2",
          name: "bar",
          parentId: "layer-1",
        },
        "layer-3": {
          id: "layer-3",
          name: "moo",
          parentId: "layer-1",
        },
      },
      allIds: ["layer-1"],
    })
  })

  it("should handle setCurrentLayer", () => {
    expect(
      layers(
        {
          byId: {
            "layer-2": {
              id: "layer-2",
            },
          },
          allIds: ["layer-1", "layer-2"],
        },
        setCurrentLayer("layer-2"),
      ),
    ).toEqual({
      byId: {
        "layer-2": {
          id: "layer-2",
        },
      },
      allIds: ["layer-1", "layer-2"],
      current: "layer-2",
      selected: "layer-2",
    })
  })

  it("should handle setSelectedLayer", () => {
    expect(
      layers(
        {
          byId: {
            "layer-2": {
              id: "layer-2",
            },
          },
          allIds: ["layer-1", "layer-2"],
        },
        setSelectedLayer("layer-2"),
      ),
    ).toEqual({
      byId: {
        "layer-2": {
          id: "layer-2",
        },
      },
      allIds: ["layer-1", "layer-2"],
      selected: "layer-2",
    })
  })

  describe("changeModelType", () => {
    it("should add default values", () => {
      expect(
        layers(
          {
            byId: {
              "layer-1": {
                id: "layer-1",
              },
            },
          },
          changeModelType({ id: "layer-1", type: "circle" }),
        ),
      ).toEqual({
        byId: {
          "layer-1": {
            id: "layer-1",
            ...circleState,
          },
        },
      })
    })

    it("should not override values if provided", () => {
      expect(
        layers(
          {
            byId: {
              "layer-1": {
                id: "layer-1",
                circleLobes: 2,
              },
            },
          },
          changeModelType({ id: "layer-1", type: "circle" }),
        ),
      ).toEqual({
        byId: {
          "layer-1": {
            id: "layer-1",
            ...circleState,
            circleLobes: 2,
          },
        },
      })
    })
  })

  it("should handle updateLayer", () => {
    expect(
      layers(
        {
          byId: {
            1: {
              id: "1",
              name: "foo",
            },
          },
        },
        updateLayer({ id: "1", name: "bar" }),
      ),
    ).toEqual({
      byId: {
        1: {
          id: "1",
          name: "bar",
        },
      },
    })
  })

  it("should handle toggleVisible", () => {
    expect(
      layers(
        {
          byId: {
            1: {
              visible: true,
            },
          },
        },
        toggleVisible({ id: "1" }),
      ),
    ).toEqual({
      byId: {
        1: {
          visible: false,
        },
      },
    })
  })

  it("should handle toggleOpen", () => {
    expect(
      layers(
        {
          byId: {
            1: {
              open: true,
            },
          },
        },
        toggleOpen({ id: "1" }),
      ),
    ).toEqual({
      byId: {
        1: {
          open: false,
        },
      },
    })
  })
})
