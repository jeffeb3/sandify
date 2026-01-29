# Test Fixtures for boundary.js

These fixtures contain real vertex data from shapes, used for testing the boundary tracing algorithm.

## How to Capture New Fixtures

1. Open Sandify in the browser
2. Create the shape you want to capture (e.g., FancyText with text "S")
3. Add a FineTuning effect with border enabled
4. Open browser console (F12)
5. Run: `window.exportVertices()`
6. Copy the JSON array output
7. Paste into the fixture file's `rawData` array

## Existing Fixtures

| File | Shape | Notes |
|------|-------|-------|
| `fancyTextSan.js` | FancyText "San" | 515 vertices, multi-path text |

## Purpose

These fixtures enable testing text/font-based shapes without requiring font loading in Node.js tests. FancyText requires browser font APIs, so pre-captured vertex data allows testing the boundary algorithm on text shapes.
