import Victor from "victor"
import { arc } from "@/common/geometry"
import { getEdgeMidpoints } from "./geometry"

// Create arc path with exact start/end points and push to paths array
function pushArcPath(
  paths,
  radius,
  startAngle,
  endAngle,
  cx,
  cy,
  startPt,
  endPt,
) {
  const arcPath = arc(radius, startAngle, endAngle, cx, cy)

  arcPath[0] = startPt.clone()
  arcPath.push(endPt.clone())
  paths.push(arcPath)
}

// Add border segments connecting edge midpoints through corners
function addTileBorder(paths, bounds, midLeft, midRight, midTop, midBottom) {
  const { left, right, top, bottom } = bounds

  paths.push([midTop.clone(), new Victor(right, top), midRight.clone()])
  paths.push([midRight.clone(), new Victor(right, bottom), midBottom.clone()])
  paths.push([midBottom.clone(), new Victor(left, bottom), midLeft.clone()])
  paths.push([midLeft.clone(), new Victor(left, top), midTop.clone()])
}

// Arc tile with stroke: inner/outer arc pairs for ribbon effect
function drawStrokedArcTile(bounds, orientation, strokeWidth, tileBorder) {
  const paths = []
  const { left, right, top, bottom } = bounds
  const cx = bounds.cx ?? (left + right) / 2
  const cy = bounds.cy ?? (top + bottom) / 2
  const baseRadius = (bounds.size ?? right - left) / 2
  const halfStroke = strokeWidth / 2
  const innerRadius = baseRadius - halfStroke
  const outerRadius = baseRadius + halfStroke

  if (orientation === 0) {
    // Top-left corner arcs
    pushArcPath(
      paths,
      innerRadius,
      Math.PI / 2,
      0,
      left,
      top,
      new Victor(left, cy - halfStroke),
      new Victor(cx - halfStroke, top),
    )
    pushArcPath(
      paths,
      outerRadius,
      Math.PI / 2,
      0,
      left,
      top,
      new Victor(left, cy + halfStroke),
      new Victor(cx + halfStroke, top),
    )

    // Bottom-right corner arcs
    pushArcPath(
      paths,
      innerRadius,
      -Math.PI / 2,
      -Math.PI,
      right,
      bottom,
      new Victor(right, cy + halfStroke),
      new Victor(cx + halfStroke, bottom),
    )
    pushArcPath(
      paths,
      outerRadius,
      -Math.PI / 2,
      -Math.PI,
      right,
      bottom,
      new Victor(right, cy - halfStroke),
      new Victor(cx - halfStroke, bottom),
    )
  } else {
    // Top-right corner arcs
    pushArcPath(
      paths,
      innerRadius,
      Math.PI,
      Math.PI / 2,
      right,
      top,
      new Victor(cx + halfStroke, top),
      new Victor(right, cy - halfStroke),
    )
    pushArcPath(
      paths,
      outerRadius,
      Math.PI,
      Math.PI / 2,
      right,
      top,
      new Victor(cx - halfStroke, top),
      new Victor(right, cy + halfStroke),
    )

    // Bottom-left corner arcs
    pushArcPath(
      paths,
      innerRadius,
      0,
      -Math.PI / 2,
      left,
      bottom,
      new Victor(cx - halfStroke, bottom),
      new Victor(left, cy + halfStroke),
    )
    pushArcPath(
      paths,
      outerRadius,
      0,
      -Math.PI / 2,
      left,
      bottom,
      new Victor(cx + halfStroke, bottom),
      new Victor(left, cy - halfStroke),
    )
  }

  if (tileBorder) {
    const { midLeft, midRight, midTop, midBottom } = getEdgeMidpoints(bounds)

    addTileBorder(paths, bounds, midLeft, midRight, midTop, midBottom)
  }

  return paths
}

// Arc tile: quarter-circle arcs at opposite corners
function drawArcTile(bounds, orientation, strokeWidth, tileBorder) {
  if (strokeWidth > 0) {
    return drawStrokedArcTile(bounds, orientation, strokeWidth, tileBorder)
  }

  const paths = []
  const { left, right, top, bottom } = bounds
  const baseRadius = (bounds.size ?? right - left) / 2
  const { midLeft, midRight, midTop, midBottom } = getEdgeMidpoints(bounds)

  if (orientation === 0) {
    pushArcPath(paths, baseRadius, Math.PI / 2, 0, left, top, midLeft, midTop)
    pushArcPath(
      paths,
      baseRadius,
      -Math.PI / 2,
      -Math.PI,
      right,
      bottom,
      midRight,
      midBottom,
    )
  } else {
    pushArcPath(
      paths,
      baseRadius,
      Math.PI,
      Math.PI / 2,
      right,
      top,
      midTop,
      midRight,
    )
    pushArcPath(
      paths,
      baseRadius,
      0,
      -Math.PI / 2,
      left,
      bottom,
      midBottom,
      midLeft,
    )
  }

  if (tileBorder) {
    addTileBorder(paths, bounds, midLeft, midRight, midTop, midBottom)
  }

  return paths
}

// Diagonal tile: lines connecting edge midpoints
function drawDiagonalTile(bounds, orientation, strokeWidth, tileBorder) {
  const paths = []
  const { left, right, top, bottom } = bounds
  const cx = bounds.cx ?? (left + right) / 2
  const cy = bounds.cy ?? (top + bottom) / 2
  const { midLeft, midRight, midTop, midBottom } = getEdgeMidpoints(bounds)

  if (strokeWidth > 0) {
    const h = strokeWidth / 2

    if (orientation === 0) {
      paths.push([new Victor(left, cy + h), new Victor(cx - h, bottom)])
      paths.push([new Victor(left, cy - h), new Victor(cx + h, bottom)])
      paths.push([new Victor(cx - h, top), new Victor(right, cy + h)])
      paths.push([new Victor(cx + h, top), new Victor(right, cy - h)])
    } else {
      paths.push([new Victor(cx + h, top), new Victor(left, cy + h)])
      paths.push([new Victor(cx - h, top), new Victor(left, cy - h)])
      paths.push([new Victor(right, cy + h), new Victor(cx + h, bottom)])
      paths.push([new Victor(right, cy - h), new Victor(cx - h, bottom)])
    }
  } else {
    if (orientation === 0) {
      paths.push([midLeft.clone(), midBottom.clone()])
      paths.push([midTop.clone(), midRight.clone()])
    } else {
      paths.push([midTop.clone(), midLeft.clone()])
      paths.push([midRight.clone(), midBottom.clone()])
    }
  }

  if (tileBorder) {
    addTileBorder(paths, bounds, midLeft, midRight, midTop, midBottom)
  }

  return paths
}

export const tileRenderers = {
  Arc: drawArcTile,
  Diagonal: drawDiagonalTile,
}
