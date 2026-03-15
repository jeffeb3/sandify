import { createSelectorCreator, lruMemoize } from "reselect"
import { isEqual } from "lodash"

// Compares inputs deeply before deciding whether to recompute.
// Default reselect uses === for inputs, so a new object reference triggers
// recomputation even if the contents are identical. This version uses deep
// equality, skipping expensive computation when inputs are structurally equal.
// Example: selectLayerVertices receives a layer object. If another selector
// returns a new layer reference with identical values, we skip vertex
// computation entirely.
export const createDeepEqualSelector = createSelectorCreator(lruMemoize, {
  equalityCheck: isEqual,
})

// Compares result deeply before deciding whether to return a new reference.
// The selector always runs, but if the new result deep-equals the cached
// result, the cached reference is returned. This preserves referential
// equality for downstream consumers (React, other selectors).
// Use for aggregation selectors that combine data from multiple sources,
// where the result often stays the same even when inputs change.
// Example: selectConnectedVertices collects vertices from all visible layers.
// When the user renames a layer, state changes and the selector runs, but
// the vertices are identical. Returning the cached array reference prevents
// React from re-rendering the canvas.
export const createResultEqualSelector = createSelectorCreator(lruMemoize, {
  resultEqualityCheck: isEqual,
})

// re-reselect config for cached selectors keyed by id with deep input comparison.
// Standard reselect only caches the most recent call. re-reselect's
// createCachedSelector maintains separate caches per key, so selecting
// layer "A" then layer "B" then layer "A" again hits the cache for "A".
// The keySelector extracts the cache key from selector arguments.
// Combined with createDeepEqualSelector, this skips recomputation when
// a cached entry exists AND its inputs are deep-equal to the current inputs.
// Example: selectLayerVertices(state, "layer-1") caches vertices for layer-1.
// Selecting a different layer doesn't evict this cache. When layer-1 is
// selected again, deep comparison of inputs determines if recomputation
// is needed.
export const cachedByIdDeepEqual = {
  keySelector: (state, id) => id,
  selectorCreator: createDeepEqualSelector,
}
