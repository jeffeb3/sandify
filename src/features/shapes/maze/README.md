# Maze

Generates perfect mazes (no loops, exactly one path between any two cells) on various grid topologies, then converts them to continuous drawing paths for sand tables.

## How It Works

1. **Build grid**: Create a cell structure based on the selected shape (rectangular, polar, hexagonal, or triangular).

2. **Generate maze**: Run a maze algorithm to carve passages between cells, producing a spanning tree.

3. **Extract walls**: Collect the wall segments (edges between unconnected cells).

4. **Eulerize**: Apply Chinese Postman to make all vertices even-degree, enabling a single continuous path.

5. **Traverse**: An Eulerian trail visits every wall segment exactly once.

## Algorithms

| Algorithm | Description | Characteristics |
|-----------|-------------|-----------------|
| Backtracker | Depth-first search with random neighbor selection | Long, winding passages; configurable straightness bias |
| Wilson | Loop-erased random walks | Uniform spanning tree; unbiased but slower on large grids |
| Prim | Frontier-based growth from random edges | Short branches, "bushy" appearance; configurable branch level |
| Kruskal | Randomly merges disjoint sets via edges | Even texture; uses union-find for efficiency |
| Division | Recursively divides space with walls | Long straight corridors; configurable horizontal bias. Rectangle only. |
| Sidewinder | Row-by-row with horizontal runs | Strong horizontal bias; fast and memory-efficient. Rectangle only. |
| Eller | Row-by-row with disjoint set tracking | Memory-efficient streaming; configurable horizontal bias. Rectangle only. |

## Grid Types

| Grid | Cell Shape | Neighbors | Notes |
|------|------------|-----------|-------|
| Rectangular | Square | 4 (north/south/east/west) | Standard orthogonal maze |
| Polar | Wedge | 3-4 (inward/outward/clockwise/counter-clockwise) | Concentric rings; cells subdivide as radius increases |
| Hexagonal | Hexagon | 6 | Pointy-top orientation |
| Triangle | Triangle | 3 | Alternating up/down triangles |

## Future Directions

### New Algorithms

- **Growing Tree Algorithm**
  - Generalization of Prim/Backtracker
  - Configurable cell selection strategy (newest, random, oldest, mixed)
  - Would provide more control over maze characteristics
- **Eller for Polar/Hex**
  - Adapt Eller's algorithm to work ring-by-ring for polar grids
  - Would require rethinking "horizontal" merging in circular context

### New Grid Types

- **Sigma (Brick) Grid**
  - Offset rectangular cells like brick pattern
  - 6 neighbors (2 horizontal, 4 diagonal)
- **Upsilon Grid**
  - Octagons with small squares at intersections
  - 8 neighbors for octagons, 4 for squares
  - Visually interesting tiling
- **Zeta Grid**
  - Rectangular cells with 45-degree diagonal passages allowed
  - 8 neighbors per cell instead of 4
  - Creates more organic-looking mazes

### Polar Enhancements

- **Radial Bias Parameter**
  - Add bias toward inward/outward movement for spiral-like patterns
  - Could apply to Backtracker and Prim for circular mazes
- **Adaptive Subdivision**
  - Currently uses fixed `doublingInterval`
  - Could auto-calculate based on maintaining uniform cell size

### Hexagonal Enhancements

- **Flat-top Orientation**
  - Alternative hex orientation option
  - Would require different neighbor and corner calculations
- **Directional Bias Along Hex Axes**
  - Bias along the 3 hex directions rather than just horizontal/vertical
  - Could create interesting flow patterns unique to hex topology

### Other Ideas

- **Wall thickness** - Configurable line weight
- **Straightness for Circle** - Adapt straightness bias for polar backtracker
- **Masks** - Remove cells to create shapes (hearts, text, holes)
