# Maze Shape Evolution

Future directions and ideas for the maze feature.

## New Algorithms

**Growing Tree Algorithm**
- Generalization of Prim/Backtracker
- Configurable cell selection strategy (newest, random, oldest, mixed)
- Would provide more control over maze characteristics

**Eller for Polar/Hex**
- Adapt Eller's algorithm to work ring-by-ring for polar grids
- Would require rethinking "horizontal" merging in circular context

## New Grid Types

**Sigma (Brick) Grid**
- Offset rectangular cells like brick pattern
- 6 neighbors (2 horizontal, 4 diagonal)

## Polar Enhancements

**Radial Bias Parameter**
- Add bias toward inward/outward movement for spiral-like patterns
- Could apply to Backtracker and Prim for circular mazes

**Adaptive Subdivision**
- Currently uses fixed `doublingInterval`
- Could auto-calculate based on maintaining uniform cell size

## Hexagonal Enhancements

**Flat-top Orientation**
- Alternative hex orientation option
- Would require different neighbor and corner calculations

**Directional Bias Along Hex Axes**
- Bias along the 3 hex directions rather than just horizontal/vertical
- Could create interesting flow patterns unique to hex topology

## Other Ideas

- **Wall thickness**: Configurable line weight
- **Straightness for Circle**: Adapt straightness bias for polar backtracker
- **Masks**: Remove cells to create shapes (hearts, text, holes)
