export const getTrig = (boundary) => (boundary === "free" ? Math.cos : Math.sin)

// Default values for superposition modes
export const defaultTerms = ({ term1, term2 }) => [term1, term2]
export const defaultScale = { rectangular: 1, circular: 2.5 }
export const defaultContours = { rectangular: 1, circular: 1 }

// Get effective value for scale or contours, handling function vs number
// For functions: fn(value) / divisor
// For numbers: num * (value / divisor)
export function getEffectiveValue(
  mode,
  key,
  shape,
  value,
  defaults,
  divisor = 1,
) {
  const v = (mode?.[key] || defaults)[shape]

  return typeof v === "function" ? v(value) / divisor : v * (value / divisor)
}
