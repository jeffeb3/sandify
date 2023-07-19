6/15/23
---

- BUG: Likely non-constant options causing re-render every time a property changes
- refactor model classes to reflect Jeff's thinking
- build a top menu; layout evolution; hamburger for smaller media
- move effects out of playlist into a new pane
- what are we doing with tracks?
- upgrade to Bootstrap 5 and rebuild the UI

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

Store
 - main
  - app
  - layers
   - idMap
   - orderedIds
  - exporter
  - machine
  - preview
 - fonts


TODO
---
- DONE model: move effects into layers; add tests
 - the logic is there, but I'm not yet using it
- ui: effects (I have code in the other branch for most of this)
 - display within layer
 - add/remove
 - reorder
- move effects from playlist
- make transform an effect
- preview window
  - konva transformer should be sized appropriately for any selected layer
   - mask
   - shape
- groups...
- other
 - new layer dropdown is not remembering last shape selected
 - upgrade to Bootstrap 5 (will probably do this in master and rebase)

CONSIDER
---
- Can effects within a layer be selected in the UI? I think the answer has to be yes; otherwise, mask will need to be a layer. Not all effects are selectable (like currently). This may be a little weird (two different selected rows affect the preview window).
