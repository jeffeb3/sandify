import preview, { updatePreview, setPreviewSize } from "./previewSlice"

describe("preview reducer", () => {
  it("should handle initial state", () => {
    expect(preview(undefined, {})).toEqual({
      canvasWidth: 600,
      canvasHeight: 600,
      sliderValue: 0,
      zoom: 1,
    })
  })

  it("should handle updatePreview", () => {
    expect(
      preview({ sliderValue: 0 }, updatePreview({ sliderValue: 50 })),
    ).toEqual({
      sliderValue: 50,
    })
  })

  it("should handle setPreviewSize", () => {
    expect(
      preview(
        { canvasWidth: 600, canvasHeight: 600 },
        setPreviewSize({ width: 800, height: 800 }),
      ),
    ).toEqual({
      canvasWidth: 800,
      canvasHeight: 800,
    })
  })
})
