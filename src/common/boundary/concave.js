/**
 * Boundary Algorithm: Concave
 *
 * Uses concaveman hull + uniform edge offset. Preserves concave details while
 * providing true uniform border width (unlike centroid scaling which stretches).
 *
 * Used by: Explicit selection only. Good for shapes where uniform
 * border width matters more than simplicity.
 */
import { applyEdgeOffset } from "./utils"

// Concave: use concaveman hull + edge offset
export const traceConcaveBoundary = (ctx) => {
  const { vertices, scale, hull } = ctx

  return applyEdgeOffset(hull, scale, vertices)
}
