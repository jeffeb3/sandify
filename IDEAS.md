# Sandify Ideas

- [Shape Ideas](#shape-ideas)
- [Effect Ideas](#effect-ideas)
- [Rejected Shape Ideas](#rejected-shape-ideas)

---

## Shape Ideas

Candidates for new shape types. All are algorithmic, render in 2D, and maintain integrity when optimized for contiguous drawing on a sand table. In addition, this provides a new list of categories that can be used to classify shapes in the UI during selection (more precise than our current **Shape** and **Eraser** categories).

| Category | Existing Shapes | New Shapes | Enhancements |
|----------|-----------------|-----------------|--------------|
| [Constructions](#constructions) | - | [Envelope Curves](#envelope-curves), [Spanning Tree](#spanning-tree) | |
| [Fields](#fields) | NoiseWave, Wiper | [Vector Fields](#vector-field-traces), [Attractors](#attractor-traces), [Noise Contours](#noise-contours), [Reaction-Diffusion](#reaction-diffusion) | [Wiper concentric](#wiper-concentric-pattern) |
| [Fractals](#fractals) | LSystem, SpaceFiller | [IFS](#ifs-iterated-function-systems), [Escape-Time](#escape-time-boundary), [Lightning](#lightning-lichtenberg), [Space Colonization](#space-colonization) | [LSystem presets](#lsystem-additional-presets), [custom rules](#lsystem-custom-user-defined) |
| [Imports](#imports) | sdf, png, jpg, webp, svg, gcode, thr | [DXF](#dxf-import) |
| [Interactive](#interactive) | - | [Doodle Draw](#doodle-draw) | |
| [Interference](#interference) | - | [Moiré](#interference-pattern), [Cymatics](#cymatics) | |
| Other | Point, V1Engineering | | |
| [Packing](#packing) | CirclePacker, Voronoi | [Tangent Circles](#tangent-circles), [Subdivision](#subdivision) | [CirclePacker fill](#circlepacker-shape-and-fill-options) |
| [Rolling Curves](#rolling-curves) | Epicycloid, Hypocycloid, FractalSpirograph | [Lissajous, Harmonograph, Guilloche](#oscillograph) | [Spirograph mode](#epicycloidhypocycloid-spirograph-mode), [FractalSpirograph options](#fractalspirograph-additional-options) |
| [Simple Curves](#simple-curves) | Circle, Polygon, Star, Heart, Reuleaux, Rose | [Superformula](#superformula-gielis-curve), [Butterfly](#butterfly-curve) | [Heart variants](#heart-equation-variants), [Polygon vertex step](#polygon-vertex-step), [Maurer mode](#rose-maurer-mode) |
| [Spirals](#spirals) | - | [Spiral](#spiral), [Stepped Spiral](#stepped-spiral), [Phyllotaxis](#phyllotaxis) | |
| Text | InputText, FancyText | | [InputText fonts](#inputtext-additional-fonts), [text on path](#text-text-on-path) |
| [Tiles](#tiles) | TessellationTwist, Maze | [Truchet](#truchet-tiles), [Labyrinth](#labyrinth-tiles), [Celtic](#wovenceltic-tiles), [Meander](#meandergreek-key-tiles), [Girih](#girih-tiles), [Hyperbolic](#hyperbolic-tiling), [Curve Stitching](#curve-stitching-tiles) | [TessellationTwist options](#tessellationtwist-additional-options), [Maze algorithms/grids](#maze-additional-algorithms-and-grids) |
| [Topology](#topology) | - | [Knot](#knot), [Braid](#braid), [Linked Rings](#linked-rings), [3D Wireframe](#3d-wireframe) | |

## Constructions

Geometric construction patterns.

### Envelope Curves

Lines tangent to a family of curves, forming a new curve.

- Standalone (non-tile-based) string art constructions
- Presets: nephroid (tangent to circle), cardioid (secant lines), parabola
- Parameters: base shape, line count, construction type

### Spanning Tree

Minimum-length network connecting a set of seed points. Branching patterns with deliberate, optimized character.

Variants:

- MST (Minimum Spanning Tree) - Connects only seed points; O(n log n) via Kruskal/Prim
- Steiner Tree - Adds junction points at 120° angles for shorter total length; uses heuristics

Seed arrangements dramatically affect output:

- Random → organic irregular branching
- Grid → geometric, axis-aligned
- Circular → radial spokes
- Spiral → follows spiral flow

Parameters: seed pattern, point count, mode (MST/Steiner)

Contiguity: tree traversal (root → tips → back)

## Fields

Patterns derived from scalar and vector fields - traced paths and extracted contours. Extends existing NoiseWave concept.

### Vector Field Traces

Trace streamlines through a 2D vector field.

- Parameters: field type, starting points (grid/random/perimeter), step count, line count
- Presets: dipole (magnetic), point charges (electric), source/sink, vortex, rotation
- Custom: user-defined field equations like `(sin(y), cos(x))`

### Attractor Traces

Iterate a dynamical system and plot the trajectory projected to 2D.

- Strange attractor aesthetics from deterministic chaos
- Parameters: attractor type (Lorenz, Rössler, Clifford, etc.), projection plane, iterations

### Noise Contours

Isolines extracted from Perlin/simplex noise fields using marching squares. Topographic map aesthetic.

- Each contour is a closed loop at constant noise "elevation"
- Contour density varies with gradient steepness (tight packing where noise changes fast)
- Distinct from Noise effect on Wiper: true isolines produce nested closed curves, not wavy parallel lines
- Parameters: noise type, contour levels, threshold range, magnification

### Reaction-Diffusion

Organic labyrinthine patterns from Gray-Scott or similar chemical simulation. See [Gray-Scott simulation](https://experiments.withgoogle.com/gray-scott-simulation).

- Turing patterns: self-organizing structures from simple reaction/diffusion rules
- Biological aesthetic: brain coral, fingerprints, animal markings
- Scope: labyrinthine variants only (spots/stripes create disconnected regions)

Challenges:

- Simulation is compute-intensive (GPU/WebGL helps)
- Requires skeleton extraction to get drawable centerline paths
- Feed/kill rate parameters must be tuned for connected labyrinths
- Contiguity requires path planning through extracted skeleton

Parameters: feed rate, kill rate, simulation steps, skeleton simplification

## Fractals

Fractal patterns from L-systems, space-filling curves, and iterative algorithms.

### IFS (Iterated Function Systems)

Apply affine transformations repeatedly to generate fractals.

- Deterministic or random iteration
- Presets: Sierpinski triangle, Barnsley fern, fractal flames
- Parameters: transformation set, iterations, rendering mode (points connected as path)

### Escape-Time Boundary

Trace the boundary of Mandelbrot/Julia sets as a continuous path.

- Boundary-following algorithm (not the full colored render)
- Parameters: set type (Mandelbrot, Julia), c value (Julia), zoom, center, max iterations

### Lightning (Lichtenberg)

Branching electrical discharge patterns using dielectric breakdown simulation.

- Probabilistic growth from seed point(s) toward attractors or edges
- Contiguity: tree structure traced root → tips → back
- Parameters: branch probability, decay rate, seed count, chaos level
- Presets: single bolt, multi-strike, Lichtenberg figure (radial)

### Space Colonization

Organic branching patterns simulating leaf veins, root networks, and vascular systems. See [2d-space-colonization-experiments](https://github.com/jasonwebb/2d-space-colonization-experiments).

- Growth lines attracted toward distributed "auxin sources," branching iteratively
- Contiguity: tree structure traced root → tips → back (like Lightning)
- Based on research into leaf venation patterns

Variants:

- Open Venation - Branches terminate without loops; tree-like
- Closed Venation - Branches can reconnect (anastomose); vein networks with loops

Parameters: attraction distance, kill distance, segment length, boundary shape, obstacle mask

## Imports

Additional file format imports. Extends existing sdf, png, jpg, webp, gcode, svg, and thr importers.

### DXF Import

CAD format common in CNC/laser communities.

- Line, arc, polyline, spline entities
- Layer selection support
- Parameters: layer filter, unit conversion, arc resolution

## Interactive

New interaction modes beyond the current shape configuration UI.

### Doodle Draw

Freehand drawing mode for creating custom shapes via mouse or pen input.

- Draw one or more path segments directly on the canvas
- Multiple segments within one shape auto-connect to maintain contiguity
- Drag/drop segments to reposition
- Save as reusable custom shape

Would require new UI mode and canvas interaction handlers.

## Interference

Wave and pattern interference effects.

### Interference Pattern

Overlapping regular patterns or wave sources creating emergent designs.

Variants:

- Moiré (Circles) - Concentric circles from multiple centers
- Moiré (Lines) - Rotated parallel line grids
- Moiré (Radial) - Overlapping spoke patterns
- Standing Waves - Circular wavefronts from point sources traced as contours

Parameters: source/pattern count, spacing, offset/rotation, wavelength (waves)

### Cymatics

Chladni figures - nodal line patterns from vibrating surfaces.

- Standing wave interference creates symmetric patterns where amplitude is zero
- Sand on vibrating plates collects along these nodal lines
- Contiguity: nodal lines form connected networks; may need path planning for multiple disconnected regions

Variants:

- Rectangular - Square/rectangular plate modes; grid-like symmetry
- Circular - Drum-head modes; radial and concentric patterns
- Custom boundary - Arbitrary plate shapes

Parameters: mode numbers (m, n), plate shape, boundary conditions (fixed/free edge)

## Packing

Arrangements of shapes that fill space. Extends existing CirclePacker and Voronoi concepts.

### Tangent Circles

Circle arrangements with tangency constraints.

Variants:

- Apollonian Gasket - Recursive packing; fill gaps with smaller tangent circles
- Steiner Chain - Circles tangent to two base circles, forming closed loop
- Doyle Spiral - Spiral arrangement with consistent size ratios

Parameters: recursion depth (Apollonian), base sizes/chain count (Steiner), growth ratio (Doyle)

### Subdivision

Nested shape arrangements with connecting paths.

Variants:

- Nested Concentrics - Concentric circles/polygons connected by radial paths
- Treemap - Nested rectangular subdivision

Parameters: shape type, ring/recursion count, connector style

## Rolling Curves

Additional oscillation-based curves. Extends existing Epicycloid, Hypocycloid, and FractalSpirograph.

### Oscillograph

Family of related curves with variants for different visual effects.

Variants:

- Lissajous - Perpendicular oscillations: `x = A*sin(at + δ)`, `y = B*sin(bt)`
- Harmonograph - Damped Lissajous with decay rate; spiral-decay patterns
- Guilloche - Multiple overlapping waves; bank-note/security aesthetic

Parameters: frequency ratio, phase shift, amplitude, damping (Harmonograph), wave count (Guilloche)

## Simple Curves

Parametric curves extending existing simple shape types.

### Superformula (Gielis Curve)

Highly flexible parametric formula for organic shapes.

```
r = (|cos(mθ/4)/a|^n2 + |sin(mθ/4)/b|^n3)^(-1/n1)
```

- Parameters: m (symmetry), n1/n2/n3 (shape exponents), a/b (scaling)
- Can generate starfish, flowers, polygons, organic forms
- Superellipse is simplified case: `|x/a|^n + |y/b|^n = 1` (single exponent)

### Butterfly Curve

Fay's butterfly - a famous polar curve with wing-like lobes.

```
r = e^sin(θ) - 2cos(4θ) + sin⁵((2θ-π)/24)
```

- Fixed equation producing one iconic shape (like Heart)
- Limited parameterization: tweaking constants distorts the butterfly identity
- Low replay value but visually distinctive

## Spirals

Spiral-based shapes with configurable growth and structure.

### Spiral

Continuous spiral with configurable growth function.

Variants:

- Archimedean - Constant spacing: `r = a + bθ`
- Fermat - Parabolic, inherently two-armed: `r = ±a√θ`
- Logarithmic - Self-similar (golden spiral): `r = ae^(bθ)`

Parameters: spacing/growth rate, turns, arm count

### Stepped Spiral

Discrete angular spiral paths.

Variants:

- Theodorus - Constructed from contiguous right triangles; mathematical aesthetic
- Polygon - Spiral with n-gon angle turns (4 = square spiral)

Parameters: step count, sides (Polygon), spacing

### Phyllotaxis

Golden angle-based arrangement (137.5°).

- Challenge: connecting points as continuous path for sand table
- Parameters: count, growth factor, connection style

## Tiles

Grid-based patterns where tiles connect at edges to form continuous paths.

### Truchet Tiles

Classic tile system where each tile contains connectors between edge midpoints. Random or rule-based rotation creates meandering continuous paths. See [intertwined quarter circles](https://observablehq.com/@xenomachina/truchet-tiles-variant-intertwined-quarter-circles).

- Parameters: grid size, tile size, rotation pattern (random, alternating, noise-based)
- Guaranteed edge connectivity

Variants:

- Arc - Quarter-circle arcs connecting adjacent edges; smooth flowing curves
- Diagonal - Straight diagonal lines; angular maze-like patterns
- Multi-scale - Recursive subdivision where tiles split into smaller Truchet patterns; organic density variation
- Hex - Adapted to hexagonal grid with 120° arcs and three-way connections; different topology
- Triangle - On triangular grids with 60° arc connections
- Corner-Arc - Arcs connect tile corners instead of edge midpoints; different intersection patterns

### Labyrinth Tiles

Tiles based on classical labyrinth seed patterns (Cretan-style).

- Always produces a single unicursal path by design
- Parameters: circuit count, entry position

### Woven/Celtic Tiles

Tiles with over-under crossing information that assemble into interlaced ribbon patterns.

- Parameters: grid size, crossing style, ribbon width

### Meander/Greek Key Tiles

Tiles that create continuous angular meander patterns.

- Classic Greek key / labyrinth border aesthetic
- Self-connecting by design
- Parameters: meander depth, tile arrangement

### Girih Tiles

Islamic geometric patterns using 5 decorated tile shapes.

- Lines on tiles connect across edges to form intricate star-and-polygon patterns
- Historically significant (medieval Islamic architecture)
- Always creates continuous interlacing lines
- Parameters: tile selection, pattern style

### Hyperbolic Tiling

Uniform tilings in hyperbolic geometry, projected to disk via Poincaré model. See [Wythoff explorer](https://gratrix.net/tile/tile.html), [Mandara catalog](https://www2u.biglobe.ne.jp/~hsaka/mandara/index.html).

- Wythoff construction: reflect fundamental polygon to fill hyperbolic plane
- Visually striking: tiles shrink toward disk edge, creating infinite recursion effect
- Contiguity: edge network requires path-finding; some retracing likely
- Parameters: polygon type (p,q,r), Wythoff operation, disk radius

### Curve Stitching Tiles

Tiles with straight-line segments that form parabolic envelope curves when combined.

- "String art" effect from discrete lines
- Parameters: line density, connection angle

## Topology

Knot and braid patterns projected to 2D. Crossings can be shown with small gaps at underpasses or accepted as self-intersections.

### Knot

Single continuous loop with self-crossings.

Variants:

- Torus - Winds p times through hole, q times around: `x = cos(pt) * (R + r*cos(qt))`
- Figure-Eight - Simplest non-trivial knot after trefoil; fixed topology
- Lissajous - 3D Lissajous projected to 2D

Parameters vary by type: p/q/tube ratio (Torus), projection angle (Figure-Eight), x/y/z frequencies and phases (Lissajous)

### Braid

Multiple interweaving strands running parallel.

- Parameters: strand count, crossing pattern (sequence or random), amplitude, wavelength
- Optionally close ends to form a loop

### Linked Rings

Multiple interlocked loops drawn sequentially.

- Borromean rings, chain links, Olympic-style
- Parameters: ring count, ring size, arrangement (linear, triangular, circular)

### 3D Wireframe

Polyhedra or parametric surfaces projected to 2D, edges traced as continuous path.

- Contiguity: requires Eulerian path through edges; some shapes need edge-doubling
- Naturally Eulerian: octahedron, grid-based surfaces (torus, Möbius)
- Non-Eulerian (need retracing): cube, tetrahedron, icosahedron, dodecahedron

Variants:

- Platonic/Archimedean Solids - Classic polyhedra with edge-doubling where needed
- Stellated Polyhedra - Star forms with extended faces
- Parametric Surfaces - Torus, Klein bottle, Möbius strip as wireframe grids
- Prisms/Antiprisms - Extruded polygons

Parameters: shape type, rotation angles, projection (orthographic/perspective), grid density (surfaces)

## Enhancements

Improvements to existing shape types.

### CirclePacker: Shape and Fill Options

Currently CirclePacker draws circle outlines only.

Ellipse Packing - Pack ellipses instead of circles. Ovals nestle together differently, creating more organic, flowing compositions. Parameters: aspect ratio range.

Fill Patterns - Fill each circle with a pattern (spiral, concentric rings, crosshatch) instead of just the outline. Transforms from outline-based to textured fill, adding visual weight and complexity.

### Epicycloid/Hypocycloid: Spirograph Mode

Add simplified spirograph-style parameters as alternative input mode.

Current parameters (R, r, pen offset) map directly to physical spirograph gears. Could add mode with more intuitive inputs: outer gear teeth, inner gear teeth, hole position. Same math, friendlier interface for users familiar with the toy.

### FractalSpirograph: Additional Options

Currently has velocity, circle count, relative size, and alternate rotation.

- Multiple Pens - Trace from multiple points on the outermost circle simultaneously. Creates more complex symmetrical patterns. Parameter: pen count.
- Inner/Outer Rolling - Toggle whether circles roll outside (epicycloid-style) or inside (hypocycloid-style) their parent. Opens new pattern families.
- Phase Offset - Starting angle for the chain. Rotates the entire pattern.
- Damping - Let radii decay over time, creating spiral-inward patterns instead of fixed loops. Transforms from repeating to one-shot decay. Parameter: decay rate.

### Heart: Equation Variants

Currently Heart uses one fixed parametric equation.

Add dropdown with different heart curve formulas - cardioid-based (pointier), sextic (sharper lobes), and variations in proportions. Subtle differences in shape character.

### InputText: Additional Fonts

Expand single-stroke font selection beyond Cursive, Sans Serif, and Monospace.

InputText already uses single-stroke fonts ideal for sand tables. The Hershey font set (public domain) includes many additional styles that could be added: Script, Gothic, Greek, Cyrillic, Japanese, symbolic/technical.

- Parameters: font selection from expanded list
- Sources: Hershey font set, CNC/engraving font collections

### LSystem: Additional Presets

Missing classic L-systems that could be added:

- Lévy C Curve - elegant symmetric fractal, simple rules
- Dragon Curve - classic folding paper fractal
- Terdragon - triangular dragon variant
- Moore Curve - Hilbert variant that closes into a loop
- Peano Curve - the original space-filling curve
- Minkowski Sausage - Koch island variant

### LSystem: Custom User-Defined

Allow users to define their own L-system rules.

Opens infinite experimentation - users can find patterns online or invent their own. Input fields for axiom, rules, angle, and draw symbols. Could include validation to catch malformed rules before rendering.

### Maze: Additional Algorithms and Grids

See src/features/shapes/maze/EVOLUTION.md for detailed ideas:

- Growing Tree algorithm (generalizes Prim/Backtracker with configurable cell selection)
- Sigma (brick), Upsilon (octagon+square), and Zeta (8-neighbor diagonal) grid types
- Polar enhancements: radial bias, adaptive subdivision
- Hex enhancements: flat-top orientation, directional bias along hex axes

### Polygon: Vertex Step

Add "vertex step" parameter to create star polygons.

Star polygons (polygrams) have a striking geometric aesthetic - clean intersecting lines forming classic symbols like the pentagram. They're mathematically elegant: one continuous path that crosses itself to form a star, distinct from the current Star shape which alternates radii.

- Step = 1 (default): regular polygon
- Step = 2+: connect every nth vertex → star polygon / polygram
- Constraint: step < sides/2, coprime with sides for single continuous path
- Examples: {5/2} pentagram, {8/3} octagram

### Rose: Maurer Mode

Add option to draw lines connecting points on the rose curve at fixed angular steps.

Creates intricate web/star patterns from the same underlying rose curve. Parameter: angular step size (degrees). When enabled, draws straight-line segments between points rather than the smooth curve.

### TessellationTwist: Additional Options

Currently has sides, iterations, and radial twist.

- Subdivision Ratio - Instead of midpoint (0.5), allow asymmetric splits (0.3, 0.7). Creates less regular, more organic patterns.
- Twist Per Level - Scale twist amount at each iteration level instead of only at final level. Parameter: multiplier.
- Twist Direction - Currently radial (more twist farther from center). Add uniform or inverse (more at center) options.

### Text: Text on Path

Render text along a curved path instead of straight baseline.

- Path types: circle, arc, spiral, wave, custom shape
- Parameters: path shape, text alignment (start/center/end), letter spacing, flip orientation
- Could reference another shape as the path source

### Wiper: Concentric Pattern

Currently Wiper has Lines (parallel zigzag) and Spiral (continuous Archimedean curve).

Concentric - Discrete rings from outside-in or inside-out, connected by radial steps. Different visual rhythm than spiral - mandala-like. Could support circle or polygon rings.

---

## Effect Ideas

Effects modify shape vertices. Classification of existing effects and candidates for new types.

| Category | Existing Effects | New Effects | Enhancements |
|----------|------------------|-------------|--------------|
| [Transform](#transform-effects) | Loop, Transformer, Track | [Mirror](#mirror), [Kaleidoscope](#kaleidoscope), [Tile](#tile) | [Track paths](#track-additional-paths) |
| [Distort](#distort-effects) | Warp, Fisheye, Noise, Voronoi | [Pixelate](#pixelate), [Spiral Wrap](#spiral-wrap), [Shatter](#shatter), [Fractal Edge](#fractal-edge) | [Warp types](#warp-additional-types) |
| [Path](#path-effects) | Mask, FineTuning | [Simplify](#simplify) | [Mask shapes](#mask-additional-shapes), [FineTuning border](#finetuning-border-options) |
| Other | ProgramCode | | |

## Transform Effects

Effects that replicate or reposition the shape.

### Mirror

Reflect shape across an axis.

- Parameters: axis angle, axis offset from center, include original (yes/no)
- Creates bilateral symmetry from asymmetric shapes
- Low complexity: flip vertex coordinates across axis line

### Kaleidoscope

Rotational symmetry with alternating reflections.

- Parameters: segment count (3-12), center offset
- Replicates shape around center; alternating copies are mirrored
- Creates snowflake/mandala-like patterns
- Differs from Loop: reflection alternation produces fold-symmetry, not just rotation

Needs prototyping to evaluate visual appeal and usability. May overlap with Loop; could alternatively be a Loop enhancement.

### Tile

Repeat shape in regular arrangements.

- Modes: grid (NxM), linear (1xN with spacing), radial (ring at fixed radius)
- Parameters: count, spacing, arrangement type
- Unlike Loop: no scale/spin, pure repetition
- Unlike Track: arranges copies, doesn't transform the shape along a path

## Distort Effects

Effects that dramatically transform vertex positions.

### Pixelate

Snap vertices to grid, creating stepped/blocky versions of smooth curves.

- Parameters: grid size, grid angle
- Retro 8-bit aesthetic from smooth organic curves
- Low complexity: round vertex coordinates to grid, deduplicate

### Spiral Wrap

Wrap shape around a spiral path, bending/stretching it along the curve.

- Parameters: tightness, turns, center offset
- Rectangular-to-spiral coordinate transform
- Unlike Track: actually deforms the shape, not just places copies
- Medium complexity; requires subsampling for smooth curves

### Shatter

Break shape into fragments with broken glass aesthetic.

Modes:
- Connected - fragments linked by thin lines (one continuous path)
- Cracked - fracture lines visible but shape intact (crazed ceramic)
- Explode - separated pieces with return path to maintain contiguity

Subdivision approaches:
- Radial slices from center
- Grid-based cuts
- Random lines through shape

Parameters: fragment count, explosion strength, seed, mode

High complexity: requires shape subdivision, clipping, and path planning for contiguity.

### Fractal Edge

Replace shape edges with fractal L-system patterns.

- Parameters: pattern type (Koch, Dragon, Cesàro), iterations, scale
- Adds intricate crystalline/organic detail to shape boundaries
- Best suited for angular shapes (Polygon, Star, imports)
- Limited effect on smooth curves (Rose, Epicycloid, etc.) - no distinct edges to replace

Note: Would require adding support to restrict effects by shape type; currently no such mechanism exists.

## Path Effects

Effects that modify path structure.

### Simplify

Reduce vertex count while preserving shape.

- Parameter: tolerance (max deviation from original path)
- Uses Ramer-Douglas-Peucker or similar algorithm
- Speeds up rendering/export, cleans up noisy imports

## Effect Enhancements

### Track: Additional Paths

Currently supports circular and spiral.

- Ellipse - elliptical track with configurable aspect ratio
- Lissajous - figure-8 and more complex oscillating paths; parameters: frequency ratio, phase

### Warp: Additional Types

Currently has angle, quad, circle, grid, shear, custom.

- wave - Sinusoidal displacement along axis; parameters: amplitude, wavelength, axis angle
- twist - Rotation amount varies with distance from center; spiral distortion
- bulge - Local expand/contract from a point; complementary to Fisheye

### Mask: Additional Shapes

Currently supports rectangle and circle.

- Polygon - n-sided regular polygon mask
- Star - star-shaped mask
- Custom - use another layer's shape as mask (reference layer)

Custom mask is high complexity: requires generalizing machine abstraction or new polygon-clipping algorithm for arbitrary shapes (point-in-polygon, perimeter tracing, line-polygon intersection).

### FineTuning: Border Options

Currently "Add perimeter border" draws convex hull.

Expand to dropdown with options:
- Convex hull (current behavior)
- Perimeter - trace actual shape outline

---

## Rejected Shape Ideas

Ideas explored but not pursued.

| Idea | Description | Reason |
|------|-------------|--------|
| Caustics | Light patterns from reflection/refraction | Covered by Envelope Curves (nephroid, cardioid) |
| Cracks/Fracture | Tension-based splitting patterns | Contiguity problems - forms closed cells, not trees |
| Delaunay + Incircles | Triangulation with inscribed circles | Covered as Voronoi enhancement |
| Euclidean Tilings | Uniform tilings on flat plane (Wythoff) | Too basic; focused on Hyperbolic instead |
| Linkage Curves | Paths from mechanical linkages (Watt's, four-bar) | Visually plain - mostly simple ovals or figure-8s |
| Orbital Paths | N-body gravitational simulations | Two-body = ellipses; three-body = chaotic or just figure-8 |
| Pursuit Curves | Paths traced by points chasing each other (mice problem, tractrix) | Visually similar to existing spirals |
| Rivers/Drainage | Dendritic branching following terrain simulation | Too similar to Lightning |
