### TODO FOR RELEASE

- get rectangular preview image from Jeff
- bug: wiper, 90 degrees with noise effect; change wiper size from 4 to 40, hangs browser
- bug: edge-case optimization of pattern with inverted mask is adding a center point within the mask; workaround is to enable "minimize perimeter moves", but this isn't user-friendly obviously

### FUTURE CONSIDERATION

- refactor slider so it's precise like fine tuning; support Shift key as well
- use react-router-dom for routes so browser back button works with tabs
- groups
  - selectLayersByGroupId - some kind of compound parent key "[a]-[b]"
  - big thunk which just changes layer dimensions
  - if it has effects, can render those via selector

## NEW IN 1.0.0

- User interface
  - Layout improvements
  - Can zoom in/out in the preview window.
  - Can now click on a layer in the preview window to select the layer.
  - Improved coloring and display layers and effects when they are selected and dragged to make editing more intuitive.
- Save and load patterns (new .sdf file format)
  - Patterns can be saved and loaded from a file.
  - Unsaved work is automatically preserved in the browser (can reload the page without losing work)
- Effects
  - Effects are now displayed within their parent layer, and are no longer shown in the "layers" list.
  - Track
    - Improved settings make it easier to either "unwind" a single shape along a prescribed track, or position multiple shapes along a track.
  - Fine tuning
    - Percentages are based on overall length of the pattern, not number of vertices. Fractional values are supported.
  - Fisheye
    - Improved rendering when applied to shapes that have straight lines
  - Transformer (new)
   - New effect to allow resizing and rotation of a given layer
- Shapes
  - Loop, scale, spin, and track transformers, as well as fine tuning settings, are now individual effects that can be added to a shape in any order, and are not added by default.
  - New "maintain aspect ratio" setting, when enabled, forced a fixed aspect ratio.
- Machines
 - Configure (add/remove/edit) multiple machines and switch between them.
 - Machine settings from imported patterns are automatically saved as an "[Imported]" machine.
- Export
  - Machine and shape settings are no longer added as comments to exported files in various formats.
