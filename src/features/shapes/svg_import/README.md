# SVG Import

Imports SVG files and converts them to continuous drawing paths for sand tables.

## Architecture

### Parsing Strategy

We inject SVG content into a hidden DOM container rather than using DOMParser. This ensures elements are proper `SVGGraphicsElement` instances with access to `getCTM()` - the browser computes cumulative transforms for us.

### Path Routing

All geometry (open paths, closed shapes, disconnected elements) feeds into a unified graph:

1. **Build graph**: Every vertex becomes a node; every segment becomes an edge.

2. **Filter outliers**: Segments longer than 10x the path's median length are dropped. This catches "closing jumps" in filled shapes that would create cross-drawing lines.

3. **Connect components**: Disconnected subgraphs are bridged using Kruskal's MST algorithm, minimizing total bridge length.

4. **Eulerize**: Duplicate edges are added to make all vertices even-degree (Chinese Postman).

5. **Traverse**: An Eulerian trail visits every edge exactly once.

This approach handles arbitrary SVG topology without special-casing open vs closed paths.

## SVG Elements

### Supported

| Element | Implementation |
|---------|----------------|
| `<path>` | Bezier linearization via `points-on-path` library |
| `<line>` | Direct extraction, subsampled |
| `<polyline>`, `<polygon>` | Direct extraction, subsampled |
| `<rect>` | Includes rounded corners (`rx`/`ry`) |
| `<circle>`, `<ellipse>` | Linearized to 128 points |
| `<g>` | Flattened; supports transforms |
| `<use>` | Expanded inline before processing |
| CSS `<style>` blocks | Resolved via `getComputedStyle()` |

### Not Supported

| Element | Description/Alternative |
|---------|--------|
| `<text>` | Convert to path in your SVG editor before export, or use the FancyText shape |
| `<image>` | Use ImageImport shape. |
| `<clipPath>`, `<mask>` | Requires boolean geometry operations, which are impractical. |
| `<marker>` | Arrow heads, etc. |
| Gradients, filters, patterns | No drawable geometry |

## Potential Enhancements

- `<clipPath>` / `<mask>` support (requires geometry library like Clipper.js)
- `<marker>` support
- Fill hatching/infill patterns
