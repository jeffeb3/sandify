import Victor from "victor"
import { arc } from "@/common/geometry"
import { getEdgePoints } from "./geometry"

// Arc tile: quarter-circle arcs at opposite corners
function drawArcTile(bounds, orientation, strokeWidth, tileBorder) {
  const paths = []
  const { left, right, top, bottom } = bounds
  const cx = bounds.cx ?? (left + right) / 2
  const cy = bounds.cy ?? (top + bottom) / 2
  const baseRadius = (bounds.size ?? (right - left)) / 2
  const halfStroke = strokeWidth / 2

  const edgePoints = getEdgePoints(bounds, [0.5])
  const midLeft = edgePoints.left[0]
  const midRight = edgePoints.right[0]
  const midTop = edgePoints.top[0]
  const midBottom = edgePoints.bottom[0]

  if (strokeWidth > 0) {
    const innerRadius = baseRadius - halfStroke
    const outerRadius = baseRadius + halfStroke

    if (orientation === 0) {
      const innerLeft1 = new Victor(left, cy - halfStroke)
      const innerTop1 = new Victor(cx - halfStroke, top)
      const outerLeft1 = new Victor(left, cy + halfStroke)
      const outerTop1 = new Victor(cx + halfStroke, top)

      const innerArc1 = arc(innerRadius, Math.PI / 2, 0, left, top)
      innerArc1[0] = innerLeft1.clone()
      innerArc1.push(innerTop1.clone())
      paths.push(innerArc1)

      const outerArc1 = arc(outerRadius, Math.PI / 2, 0, left, top)
      outerArc1[0] = outerLeft1.clone()
      outerArc1.push(outerTop1.clone())
      paths.push(outerArc1)

      const innerRight2 = new Victor(right, cy + halfStroke)
      const innerBottom2 = new Victor(cx + halfStroke, bottom)
      const outerRight2 = new Victor(right, cy - halfStroke)
      const outerBottom2 = new Victor(cx - halfStroke, bottom)

      const innerArc2 = arc(innerRadius, -Math.PI / 2, -Math.PI, right, bottom)
      innerArc2[0] = innerRight2.clone()
      innerArc2.push(innerBottom2.clone())
      paths.push(innerArc2)

      const outerArc2 = arc(outerRadius, -Math.PI / 2, -Math.PI, right, bottom)
      outerArc2[0] = outerRight2.clone()
      outerArc2.push(outerBottom2.clone())
      paths.push(outerArc2)
    } else {
      const innerTop1 = new Victor(cx + halfStroke, top)
      const innerRight1 = new Victor(right, cy - halfStroke)
      const outerTop1 = new Victor(cx - halfStroke, top)
      const outerRight1 = new Victor(right, cy + halfStroke)

      const innerArc1 = arc(innerRadius, Math.PI, Math.PI / 2, right, top)
      innerArc1[0] = innerTop1.clone()
      innerArc1.push(innerRight1.clone())
      paths.push(innerArc1)

      const outerArc1 = arc(outerRadius, Math.PI, Math.PI / 2, right, top)
      outerArc1[0] = outerTop1.clone()
      outerArc1.push(outerRight1.clone())
      paths.push(outerArc1)

      const innerBottom2 = new Victor(cx - halfStroke, bottom)
      const innerLeft2 = new Victor(left, cy + halfStroke)
      const outerBottom2 = new Victor(cx + halfStroke, bottom)
      const outerLeft2 = new Victor(left, cy - halfStroke)

      const innerArc2 = arc(innerRadius, 0, -Math.PI / 2, left, bottom)
      innerArc2[0] = innerBottom2.clone()
      innerArc2.push(innerLeft2.clone())
      paths.push(innerArc2)

      const outerArc2 = arc(outerRadius, 0, -Math.PI / 2, left, bottom)
      outerArc2[0] = outerBottom2.clone()
      outerArc2.push(outerLeft2.clone())
      paths.push(outerArc2)
    }
  } else {
    if (orientation === 0) {
      const arc1 = arc(baseRadius, Math.PI / 2, 0, left, top)
      arc1[0] = midLeft.clone()
      arc1.push(midTop.clone())
      paths.push(arc1)

      const arc2 = arc(baseRadius, -Math.PI / 2, -Math.PI, right, bottom)
      arc2[0] = midRight.clone()
      arc2.push(midBottom.clone())
      paths.push(arc2)
    } else {
      const arc1 = arc(baseRadius, Math.PI, Math.PI / 2, right, top)
      arc1[0] = midTop.clone()
      arc1.push(midRight.clone())
      paths.push(arc1)

      const arc2 = arc(baseRadius, 0, -Math.PI / 2, left, bottom)
      arc2[0] = midBottom.clone()
      arc2.push(midLeft.clone())
      paths.push(arc2)
    }
  }

  if (tileBorder) {
    paths.push([midTop.clone(), new Victor(right, top), midRight.clone()])
    paths.push([midRight.clone(), new Victor(right, bottom), midBottom.clone()])
    paths.push([midBottom.clone(), new Victor(left, bottom), midLeft.clone()])
    paths.push([midLeft.clone(), new Victor(left, top), midTop.clone()])
  }

  return paths
}

// Diagonal tile: lines connecting edge midpoints
function drawDiagonalTile(bounds, orientation, strokeWidth, tileBorder) {
  const paths = []
  const { left, right, top, bottom } = bounds
  const cx = bounds.cx ?? (left + right) / 2
  const cy = bounds.cy ?? (top + bottom) / 2

  const edgePoints = getEdgePoints(bounds, [0.5])
  const midLeft = edgePoints.left[0]
  const midRight = edgePoints.right[0]
  const midTop = edgePoints.top[0]
  const midBottom = edgePoints.bottom[0]

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
    paths.push([midTop.clone(), new Victor(right, top), midRight.clone()])
    paths.push([midRight.clone(), new Victor(right, bottom), midBottom.clone()])
    paths.push([midBottom.clone(), new Victor(left, bottom), midLeft.clone()])
    paths.push([midLeft.clone(), new Victor(left, top), midTop.clone()])
  }

  return paths
}

// Multiscale Slash tile: arcs connecting at 1/3 and 2/3 positions
export function drawMultiscaleSlashTile(
  bounds,
  orientation,
  strokeWidth,
  tileBorder,
) {
  const paths = []
  const { left, right, top, bottom, size } = bounds

  const edgePoints = getEdgePoints(bounds, [1 / 3, 2 / 3])
  const radius = size / 3

  if (orientation === 0) {
    const arc1 = arc(radius, Math.PI / 2, 0, left, top + size / 3)
    arc1[0] = edgePoints.left[0].clone()
    arc1.push(edgePoints.top[0].clone())
    paths.push(arc1)

    const arc2 = arc(radius, 0, -Math.PI / 2, left, bottom - size / 3)
    arc2[0] = edgePoints.left[1].clone()
    arc2.push(edgePoints.bottom[0].clone())
    paths.push(arc2)

    const arc3 = arc(radius, Math.PI, Math.PI / 2, right, top + size / 3)
    arc3[0] = edgePoints.top[1].clone()
    arc3.push(edgePoints.right[0].clone())
    paths.push(arc3)

    const arc4 = arc(radius, -Math.PI / 2, -Math.PI, right, bottom - size / 3)
    arc4[0] = edgePoints.right[1].clone()
    arc4.push(edgePoints.bottom[1].clone())
    paths.push(arc4)
  } else {
    const arc1 = arc(radius, Math.PI, Math.PI / 2, right - size / 3, top)
    arc1[0] = edgePoints.top[0].clone()
    arc1.push(edgePoints.right[0].clone())
    paths.push(arc1)

    const arc2 = arc(radius, Math.PI / 2, 0, left + size / 3, top)
    arc2[0] = edgePoints.top[1].clone()
    arc2.push(edgePoints.left[0].clone())
    paths.push(arc2)

    const arc3 = arc(radius, 0, -Math.PI / 2, left + size / 3, bottom)
    arc3[0] = edgePoints.left[1].clone()
    arc3.push(edgePoints.bottom[0].clone())
    paths.push(arc3)

    const arc4 = arc(radius, -Math.PI / 2, -Math.PI, right - size / 3, bottom)
    arc4[0] = edgePoints.bottom[1].clone()
    arc4.push(edgePoints.right[1].clone())
    paths.push(arc4)
  }

  if (tileBorder) {
    paths.push([new Victor(left, top), edgePoints.top[0].clone()])
    paths.push([edgePoints.top[0].clone(), edgePoints.top[1].clone()])
    paths.push([edgePoints.top[1].clone(), new Victor(right, top)])

    paths.push([new Victor(right, top), edgePoints.right[0].clone()])
    paths.push([edgePoints.right[0].clone(), edgePoints.right[1].clone()])
    paths.push([edgePoints.right[1].clone(), new Victor(right, bottom)])

    paths.push([new Victor(right, bottom), edgePoints.bottom[1].clone()])
    paths.push([edgePoints.bottom[1].clone(), edgePoints.bottom[0].clone()])
    paths.push([edgePoints.bottom[0].clone(), new Victor(left, bottom)])

    paths.push([new Victor(left, bottom), edgePoints.left[1].clone()])
    paths.push([edgePoints.left[1].clone(), edgePoints.left[0].clone()])
    paths.push([edgePoints.left[0].clone(), new Victor(left, top)])
  }

  return paths
}

export const tileRenderers = {
  Arc: drawArcTile,
  Diagonal: drawDiagonalTile,
}
