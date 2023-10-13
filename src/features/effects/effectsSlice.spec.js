import { resetUniqueId } from "@/common/mocks"
import effectsReducer, {
  addEffect,
  deleteEffect,
  setSelectedEffect,
  setCurrentEffect,
  selectEffectsByLayerId,
  updateEffect,
  restoreDefaults,
} from "./effectsSlice"
import EffectLayer from "./EffectLayer"

beforeEach(() => {
  resetUniqueId()
})

// ------------------------------
// Slice, reducers and atomic actions
// ------------------------------

describe("effects reducer", () => {
  const maskState = new EffectLayer("mask").getInitialState()

  it("should handle initial state", () => {
    expect(effectsReducer(undefined, {})).toEqual({
      ids: [],
      entities: {},
    })
  })

  it("should handle addEffect", () => {
    expect(
      effectsReducer(
        {
          ids: [],
          entities: {},
        },
        addEffect({
          name: "foo",
        }),
      ),
    ).toEqual({
      ids: ["1"],
      entities: {
        1: {
          id: "1",
          name: "foo",
        },
      },
      current: "1",
      selected: "1",
    })
  })

  it("should handle deleteEffect", () => {
    expect(
      effectsReducer(
        {
          ids: ["1"],
          entities: {
            1: {
              id: "1",
              name: "foo",
            },
          },
        },
        deleteEffect("1"),
      ),
    ).toEqual({
      entities: {},
      ids: [],
    })
  })

  it("should handle updateEffect", () => {
    expect(
      effectsReducer(
        {
          ids: ["1"],
          entities: {
            1: {
              id: "1",
              name: "foo",
            },
          },
        },
        updateEffect({ id: "1", name: "bar" }),
      ),
    ).toEqual({
      ids: ["1"],
      entities: {
        1: {
          id: "1",
          name: "bar",
        },
      },
    })
  })

  it("should handle setCurrentEffect", () => {
    expect(
      effectsReducer(
        {
          entities: {
            0: {},
            1: {},
          },
          current: "0",
        },
        setCurrentEffect("1"),
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

  it("should handle setSelectedEffect", () => {
    expect(
      effectsReducer(
        {
          entities: {
            0: {},
            1: {},
          },
          selected: "1",
        },
        setSelectedEffect("0"),
      ),
    ).toEqual({
      entities: {
        0: {},
        1: {},
      },
      selected: "0",
    })
  })

  it("should handle restoreDefaults", () => {
    expect(
      effectsReducer(
        {
          entities: {
            0: {
              id: "0",
              name: "foo",
              type: "mask",
              height: "26",
              width: "26",
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
          ...maskState,
        },
      },
    })
  })
})

// ------------------------------
// Selectors
// ------------------------------
describe("effects selectors", () => {
  const initialState = {
    effects: {
      ids: ["1", "2", "3"],
      entities: {
        1: { id: "1", layerId: "A" },
        2: { id: "2", layerId: "B" },
        3: { id: "3", layerId: "A" },
      },
    },
  }

  describe("selectEffectsByLayerId", () => {
    it("should return effects that match the specified layerId", () => {
      const layerId = "A"
      const expectedEffects = [
        { id: "1", layerId: "A" },
        { id: "3", layerId: "A" },
      ]
      const selectedEffects = selectEffectsByLayerId(initialState, layerId)

      expect(selectedEffects).toEqual(expectedEffects)
    })

    it("should return an empty array if no effects match the specified layerId", () => {
      const layerId = "C"
      const selectedEffects = selectEffectsByLayerId(initialState, layerId)

      expect(selectedEffects).toEqual([])
    })
  })
})
