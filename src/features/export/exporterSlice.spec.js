import exporter, { updateExporter } from "./exporterSlice"

describe("exporter reducer", () => {
  it("should handle initial state", () => {
    expect(exporter(undefined, {})).toEqual({
      fileName: "sandify",
      fileType: "gcode",
      polarRhoMax: 1,
      unitsPerCircle: 6,
      pre: "",
      post: "",
      reverse: false,
    })
  })

  it("should handle updateExporter", () => {
    expect(
      exporter({ filename: "" }, updateExporter({ filename: "test_filename" })),
    ).toEqual({
      filename: "test_filename",
    })
  })
})
