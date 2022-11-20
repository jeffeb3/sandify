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
