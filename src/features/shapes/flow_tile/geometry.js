import Victor from "victor"

export function tileBounds(cx, cy, size = 2) {
  const half = size / 2
  return {
    left: cx - half,
    right: cx + half,
    top: cy - half,
    bottom: cy + half,
    cx,
    cy,
    size,
  }
}

// Get connection points along tile edges at specified fractions
export function getEdgePoints(bounds, fractions = [0.5]) {
  const { left, right, top, bottom } = bounds
  const width = right - left
  const height = bottom - top

  return {
    left: fractions.map((f) => new Victor(left, top + height * f)),
    right: fractions.map((f) => new Victor(right, top + height * f)),
    top: fractions.map((f) => new Victor(left + width * f, top)),
    bottom: fractions.map((f) => new Victor(left + width * f, bottom)),
  }
}
