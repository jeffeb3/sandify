const colors = {
  selectedShapeColor: "rgba(255, 255, 0, 0.7)", // yellow
  slidingColor: "#2983BA", // blue
  activeEffectColor: "rgba(15, 128, 0, 0.8)", // green
  unselectedShapeColor: "rgba(195, 214, 230, 0.4)", // gray
  noSelectionColor: "rgba(255, 255, 0, 0.7)", // slightly muted yellow
  activeConnectorColor: "#2983BA", // blue
  endPointColor: "red",
  startPointColor: "rgb(15, 128, 0)", // green
  transformerBorderColor: "#fefefe", // almost white
}

// ITU-R BT.601 luminance formula for perceived brightness
const luminance = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b

// Parse a CSS color string and return perceived brightness (0-255), or null if unparseable
export const getColorBrightness = (color) => {
  if (!color || color === "none") {
    return null
  }

  const c = color.toLowerCase().trim()

  if (c.startsWith("#")) {
    let hex = c.slice(1)

    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
    }

    if (hex.length === 6 && /^[0-9a-f]{6}$/.test(hex)) {
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)

      return luminance(r, g, b)
    }
  }

  const rgbMatch = c.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)

  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10)
    const g = parseInt(rgbMatch[2], 10)
    const b = parseInt(rgbMatch[3], 10)

    return luminance(r, g, b)
  }

  const namedColors = {
    black: 0,
    white: 255,
    red: 76,
    green: 150,
    blue: 29,
    yellow: 226,
    orange: 156,
    brown: 101,
    gray: 128,
    grey: 128,
  }

  if (namedColors[c] !== undefined) {
    return namedColors[c]
  }

  return null
}

export default colors
