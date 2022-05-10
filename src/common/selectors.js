import { defaultMemoize } from 'reselect'

// from https://github.com/reduxjs/reselect/issues/441
export const memoizeArrayProducingFn = (fn) => {
  const memArray = defaultMemoize((...array) => array)
  return (...args) => memArray(...fn(...args))
}
