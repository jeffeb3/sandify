### TODO
- I don't really understand the best way to manage efficient re-renders and orphaned state, e.g., deletion of a layer or effect. Need to read up.

- wiper dimensions are incorrect
- change polygon number of sides and height/width ratio stays same, so it's scrunched; I think this is similar to how fancy text gets squeezed
- restore defaults should not clobber effects; if it does, need to delete them explicitly
- when hiding a non-current row, should probably allow the toggle without setting the current row? Else deal with the weird issues when you do this. Happens for effects and layers.
- sensible effect defaults for every effect
- many effects are broken
- copy effect

- for groups, consider a similar setup, but with
  - selectLayersByGroupId - some kind of compound parent key "[a]-[b]"
  - big thunk which just changes layer dimensions
  - if it has effects, can render those via selector

- clean up selector code
- thunk for current selection across effects and layers
- do an initial resize is needed when page loads
- handle text sizing so it can resize as you type
- what are we doing with tracks?

- Layer knows model, is given vertices and effects
- PreviewLayer gets vertices, applies effects? selectors guarantee this only happens when layer or effects change.
- Downloader uses its own mechanism (would thunk work?) to loop through everything.

### DONE
- DONE: thunk for delete layer and associated effects
- DONE: move model caching
- DONE: proper transformer sizing
- DONE: refactor model classes to reflect Jeff's thinking
- DONE: add selectLayerVertices that takes
  - selectLayerById, selectEffectsByLayerId - changes to layer or any effects
  - instantiates layer and effects and draws the whole thing
- Effects
  - DONE: when there are no effects, add a button instead of the list


### MAYBE
- build a top menu; layout evolution; hamburger for smaller media
- upgrade to Bootstrap 5 and rebuild the UI

### IDEAS
Model
 - options (editable)
 - attrs (readonly)

Effect > Model

Layer
 - options (editable)
  - reverse
  - connectionMethod
  - name

Shape > Layer
 - options (editable)
  - x-offset
  - y-offset
  - width
  - height

 - effects
 - shape
 - parent (if in group)

Group > Layer
 - children (layers)
 - dynamic attributes that user can set which recalculate children
  - width
  - height
