/**
 * Boundary Algorithm: Expand (Default)
 *
 * Uses concaveman hull + centroid scaling. Preserves concave details while
 * scaling uniformly from shape center. Fast and works well for most shapes.
 *
 * Used by: Star, Polygon, Heart, Circle, Reuleaux, Rose, Epicycloid, Hypocycloid,
 * V1Engineering, and most other simple closed shapes.
 */
import { applyCentroidScale } from "./utils"

// Expand: use concaveman hull + centroid scaling
export const traceExpandBoundary = (ctx) => {
  const { vertices, scale, hull } = ctx

  return applyCentroidScale(hull, vertices, scale)
}
