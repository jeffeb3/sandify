# Machines

Machines clip drawing paths to boundaries. This powers two features:

1. **Machine limits** - Constrain output to the physical drawing area (rectangle or circle)
2. **Layer masks** - Clip shapes to arbitrary polygons (using PolygonMachine) for masking effects

## Architecture

Machines implement a `polish()` pipeline that transforms raw shape vertices into drawable paths:

```
Shape vertices
 → enforceLimits()
 → cleanVertices()
 → optimizeSteps()
 → Output
```

## Machine Types

Each machine type has a **normal** and **inverted** variant. Normal machines constrain to a shape, and their inverted machines keep geometry **outside** the boundary, creating "cutout" effects.

| Machine | Inverted | Boundary | Description |
|---------|----------|----------|-------------|
| `RectMachine` | `RectInvertedMachine` | Rectangle | Axis-aligned box defined by `minX`, `maxX`, `minY`, `maxY` |
| `PolarMachine` | `PolarInvertedMachine` | Circle | Circle defined by `maxRadius` centered at origin |
| `PolygonMachine` | `PolygonInvertedMachine` | Polygon | Arbitrary polygon; used for layer masks |

## How Machines Work

The core clipping algorithm walks each segment of the input path. For each segment, `clipSegment()` determines what portion (if any) lies inside the boundary. When a path exits the boundary, we find the intersection point. When it re-enters, we trace along the perimeter from exit to entry, keeping the drawing continuous. The `inBounds()` method tests whether a point is inside (ray-casting for polygons, distance check for circles, outcode check for rectangles).

Polygon clipping presents special challenges. For **closed paths**, we use Clipper2 boolean operations (`Intersect` for normal, `Difference` for inverted) which handle complex cases correctly. For **open paths** like fractals and spirographs, we fall back to line-by-line clipping since they aren't valid polygons. **Self-intersecting paths** like Rose curves also require line-by-line mode because Clipper2 treats self-intersections as simple region boundaries, losing the internal crossing pattern.

For layer masks, we must first extract a clean polygon boundary from the source layer's vertices. The `traceBoundary()` function handles this, converting arbitrary shapes—including multi-path text, fill patterns, and self-intersecting curves—into a single closed polygon suitable for clipping.

### Boundary Tracing Algorithms

Different shape types require different boundary extraction approaches:

| Algorithm | Method | Best For |
|-----------|--------|----------|
| `expand` | Concaveman hull + centroid scaling | Simple closed shapes (Star, Heart, Circle) |
| `concave` | Concaveman hull + edge offset | Fill patterns (Voronoi, Tessellation) |
| `footprint` | Stroke → bitmap → SDF contour | Complex multi-path (text, fractals, open paths) |
| `convex` | Convex hull | Fast fallback |

**Auto-detection** selects the best algorithm based on shape characteristics: path count, open vs closed, SDF ratio, and whether it's a fill pattern. Users can override via the FineTuning effect's border algorithm dropdown.

The **footprint** algorithm deserves special mention: it rasterizes the stroked path to a bitmap, computes a signed distance field (SDF), then extracts the contour at a threshold. SDF is a technique popularized by Valve for font rendering and now common in game engines—we apply it here to boundary extraction. This handles disconnected paths (like separate letters) that would defeat hull-based approaches.

### Multiple Disconnected Regions

When clipping creates separate regions, graph-based optimization connects them:

1. **Build graph**: Each clipped region becomes edges
2. **Connect components**: Bridge via MST (Kruskal)
3. **Eulerize**: Add edges for odd-degree vertices (Chinese Postman)
4. **Traverse**: Eulerian trail visits every edge once

This minimizes pen-up travel between regions.

## Potential Enhancements

1. **Disable border option for erasers** - SpaceFiller, CirclePacker, NoiseWave, Wiper shouldn't have border option
2. **Performance tuning** - Footprint algorithm may slow down at higher padding values
3. **Border not included in shape dimensions** - Border should be included when calculating shape bounds in UI
4. **Preserve holes in layer masks** - Option to retain holes (like center of "O", "A") instead of filling them
