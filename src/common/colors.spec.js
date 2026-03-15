import { getColorBrightness } from "./colors"

describe("getColorBrightness", () => {
  describe("hex colors", () => {
    it("returns 0 for black", () => {
      expect(getColorBrightness("#000000")).toBe(0)
    })

    it("returns 255 for white", () => {
      expect(getColorBrightness("#ffffff")).toBe(255)
    })

    it("handles 3-digit hex", () => {
      expect(getColorBrightness("#000")).toBe(0)
      expect(getColorBrightness("#fff")).toBe(255)
    })

    it("calculates luminance for red", () => {
      // Red: 0.299 * 255 = 76.245
      expect(getColorBrightness("#ff0000")).toBeCloseTo(76.245)
    })

    it("calculates luminance for green", () => {
      // Green: 0.587 * 255 = 149.685
      expect(getColorBrightness("#00ff00")).toBeCloseTo(149.685)
    })

    it("calculates luminance for blue", () => {
      // Blue: 0.114 * 255 = 29.07
      expect(getColorBrightness("#0000ff")).toBeCloseTo(29.07)
    })

    it("is case insensitive", () => {
      expect(getColorBrightness("#FFFFFF")).toBe(255)
      expect(getColorBrightness("#FfFfFf")).toBe(255)
    })
  })

  describe("rgb/rgba colors", () => {
    it("parses rgb format", () => {
      expect(getColorBrightness("rgb(255, 255, 255)")).toBe(255)
      expect(getColorBrightness("rgb(0, 0, 0)")).toBe(0)
    })

    it("parses rgba format", () => {
      expect(getColorBrightness("rgba(255, 255, 255, 0.5)")).toBe(255)
    })

    it("handles spaces in rgb", () => {
      expect(getColorBrightness("rgb(  255 ,  255 ,  255  )")).toBe(255)
    })
  })

  describe("named colors", () => {
    it("returns correct brightness for named colors", () => {
      expect(getColorBrightness("black")).toBe(0)
      expect(getColorBrightness("white")).toBe(255)
      expect(getColorBrightness("gray")).toBe(128)
      expect(getColorBrightness("grey")).toBe(128)
    })

    it("is case insensitive", () => {
      expect(getColorBrightness("BLACK")).toBe(0)
      expect(getColorBrightness("White")).toBe(255)
    })
  })

  describe("invalid/special values", () => {
    it("returns null for 'none'", () => {
      expect(getColorBrightness("none")).toBeNull()
    })

    it("returns null for empty string", () => {
      expect(getColorBrightness("")).toBeNull()
    })

    it("returns null for null input", () => {
      expect(getColorBrightness(null)).toBeNull()
    })

    it("returns null for undefined input", () => {
      expect(getColorBrightness(undefined)).toBeNull()
    })

    it("returns null for unrecognized color names", () => {
      expect(getColorBrightness("hotpink")).toBeNull()
      expect(getColorBrightness("notacolor")).toBeNull()
    })

    it("returns null for invalid hex", () => {
      expect(getColorBrightness("#gggggg")).toBeNull()
      expect(getColorBrightness("#12345")).toBeNull()
    })
  })

  describe("whitespace handling", () => {
    it("trims whitespace", () => {
      expect(getColorBrightness("  #ffffff  ")).toBe(255)
      expect(getColorBrightness("  black  ")).toBe(0)
    })
  })
})
