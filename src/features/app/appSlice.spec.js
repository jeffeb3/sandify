import app from "./appSlice"

describe("app reducer", () => {
  it("should handle initial state", () => {
    expect(app(undefined, {})).toEqual({
      sandifyVersion: "0.2.8", // Also change the version in package.json.
    })
  })
})
