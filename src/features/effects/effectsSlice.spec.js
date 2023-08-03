import { resetUniqueId } from "@/common/mocks"
import effects, { addEffect, deleteEffect } from "./effectsSlice"

beforeEach(() => {
  resetUniqueId()
})

describe("effects reducer", () => {
  it("should handle initial state", () => {
    expect(effects(undefined, {})).toEqual({
      ids: [],
      entities: {},
    })
  })

  it("should handle addEffect", () => {
    expect(
      effects(
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
    })
  })

  it("should handle deleteEffect", () => {
    expect(
      effects(
        {
          ids: ["1"],
          entities: {
            1: {
              id: "1",
              name: "foo",
            },
          },
          current: "1",
        },
        deleteEffect("1"),
      ),
    ).toEqual({
      entities: {},
      ids: [],
      current: undefined,
    })
  })
})
