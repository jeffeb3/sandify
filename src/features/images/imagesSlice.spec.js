import { resetUniqueId } from "@/common/mocks"
import imagesReducer, { addImage, deleteImage } from "./imagesSlice"

beforeEach(() => {
  resetUniqueId()
})

// ------------------------------
// Slice, reducers and atomic actions
// ------------------------------

describe("images reducer", () => {
  it("should handle initial state", () => {
    expect(imagesReducer(undefined, {})).toEqual({
      ids: [],
      entities: {},
      loaded: false,
    })
  })

  it("should handle addImage", () => {
    expect(
      imagesReducer(
        {
          ids: [],
          entities: {},
        },
        addImage({
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
    })
  })

  it("should handle deleteImage", () => {
    expect(
      imagesReducer(
        {
          ids: ["1"],
          entities: {
            1: {
              id: "1",
              name: "foo",
            },
          },
        },
        deleteImage("1"),
      ),
    ).toEqual({
      entities: {},
      ids: [],
    })
  })
})
