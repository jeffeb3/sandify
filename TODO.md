### TODO FOR RELEASE

- bug: wiper, 90 degrees with noise effect; change wiper size from 4 to 40, hangs browser
- bug: edge-case optimization of pattern with inverted mask is adding a center point within the mask; workaround is to enable "minimize perimeter moves", but this isn't user-friendly obviously

### FUTURE CONSIDERATION

- refactor slider so it's precise like fine tuning; support Shift key as well
- use react-router-dom for routes so browser back button works with tabs
- groups
  - selectLayersByGroupId - some kind of compound parent key "[a]-[b]"
  - big thunk which just changes layer dimensions
  - if it has effects, can render those via selector
- store pattern name and other desired attribution (?) in exported file and display it somewhere (either stats tab or in the preview window)
- show pattern start/end type (e.g., 1-0) if start/end if specified
- new fine tuning setting: when backtracking at end, optionally ignore border if enabled
