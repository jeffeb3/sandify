import { createSelectorCreator, defaultMemoize } from "reselect"
import isEqual from "lodash"

// from https://github.com/reduxjs/reselect/issues/441
export const memoizeArrayProducingFn = (fn) => {
  const memArray = defaultMemoize((...array) => array)
  return (...args) => memArray(...fn(...args))
}

// does a deep equality check instead of checking immutability; used in cases
// where a selector depends on another selector that returns a new object each time,
// e.g., selectLayerIndexById
export const createDeepEqualSelector = createSelectorCreator(
  defaultMemoize,
  isEqual,
)
