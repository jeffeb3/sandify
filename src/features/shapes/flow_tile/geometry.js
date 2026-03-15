import Victor from "victor"

// Compute bounding box for a tile centered at (cx, cy)
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

// Get edge midpoints as named properties
export function getEdgeMidpoints(bounds) {
  const edgePoints = getEdgePoints(bounds, [0.5])

  return {
    midLeft: edgePoints.left[0],
    midRight: edgePoints.right[0],
    midTop: edgePoints.top[0],
    midBottom: edgePoints.bottom[0],
  }
}
