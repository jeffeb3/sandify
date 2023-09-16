### TODO FOR RELEASE

- hitfunc
 - active effect is overly big; should be able to draw multiple bounded shapes vs a combined footprint
 - something weird going on with inability to select layer if effect hit area overlaps?
 - any selectable effect that hides the original shape should in theory be click-selectable
- cannot drag points (hit area too small)
- handle catastrophic state failure, and allow full reset
- get rectangular preview image from Jeff
- bump up version; maybe 1.0?

- add any missing specs
- code cleanup
- review/test EVERYTHING
  - all shapes/effects
  - machines
  - exports (faithful representation?)
  - imports
  - save/load/new

### FUTURE CONSIDERATION

- refactor slider so it's precise like fine tuning
- use react-router-dom for routes so browser back button works with tabs
- groups
  - selectLayersByGroupId - some kind of compound parent key "[a]-[b]"
  - big thunk which just changes layer dimensions
  - if it has effects, can render those via selector
- when shift key is pressed, step should move in finer increments
