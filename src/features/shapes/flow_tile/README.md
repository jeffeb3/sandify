# Flow Tile (Truchet)

Generates Truchet tiling patterns - square tiles with two orientations that connect to form continuous flowing paths.

## Architecture

Tiles are drawn independently, then unified into a single continuous path:

1. **Draw tiles**: Each tile generates arc/line paths based on its orientation (determined by seed + noise).

2. **Draw outer border**: Perimeter segments connect tile edges to form a closed boundary.

3. **Build graph**: Path endpoints become nodes; paths become edges with stored vertex data.

4. **Connect components**: Disconnected subgraphs are bridged via MST.

5. **Eulerize**: Duplicate edges added for odd-degree vertices (Chinese Postman).

6. **Traverse**: Eulerian trail visits every edge exactly once, expanding stored paths.

This produces a single continuous drawing path.

## Tile Styles

| Style | Connection Points | Description |
|-------|-------------------|-------------|
| Arc | Edge midpoints (1/2) | Quarter-circle arcs at opposite corners. Classic Smith Truchet. |
| Diagonal | Edge midpoints (1/2) | Straight lines connecting opposite edges. Maze-like patterns. |

## Potential Enhancements

**Tile Styles**
- **Multiscale Truchet**: [Carlson's multi-scale patterns](https://christophercarlson.com/portfolio/multi-scale-truchet-patterns/) - recursive subdivision where any tile can be replaced by four smaller tiles.
- **Maze tiles**: 4-gate connections (straight, corner, T, cross) for true maze generation.
- **Weave tiles**: Over/under crossings with alternating pattern.

**Grid Variations** (would require new shape or significant refactor - tile geometry, borders, and stroke width are grid-specific; path connection logic is reusable)
- **Hexagonal**: 3 arc variations per tile, weave-like patterns. See [SciPython](https://scipython.com/blog/hexagonal-truchet-tiling/).
- **Triangle**: 2 points per edge, 3 tile types. See [Bridges 2020](https://www.archive.bridgesmathart.org/2020/bridges2020-191.pdf).

**Other**
- **Orientation bias**: Slider to control probability of orientation 0 vs 1.

## References

- [Wikipedia: Truchet tiles](https://en.wikipedia.org/wiki/Truchet_tiles)
- [Carlson: Multi-Scale Truchet Patterns](https://christophercarlson.com/portfolio/multi-scale-truchet-patterns/)
- [Bridges 2018 Paper](https://archive.bridgesmathart.org/2018/bridges2018-39.html) - Carlson's original paper on multi-scale patterns
