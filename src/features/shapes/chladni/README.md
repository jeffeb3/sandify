# Chladni Figures ("Vibrations")

Chladni figures generate nodal line patterns from vibrating plates. When a plate vibrates, sand collects along lines where amplitude is zero, creating symmetric geometric patterns. This shape computes the vibration field mathematically and extracts contour lines.

## Architecture

The pipeline converts a 2D vibration equation into drawable paths:

1. **Compute field**: Sample vibration amplitude on a grid using the selected method (interference, harmonic, or excitation). Resolution scales with complexity: `200 + complexity * 20`.

2. **Extract contours**: The `marching-squares` library finds iso-lines at threshold values (z=0 for nodal lines, plus additional amplitude contours).

3. **Build graph**: Contour segments become edges in a graph structure.

4. **Eulerize**: Duplicate edges added to make all vertices even-degree (Chinese Postman).

5. **Traverse**: An Eulerian trail visits every edge exactly once. This ensures a continuous path.


## Methods

### Interference

Two-mode superposition - the classic Chladni pattern. Two vibration modes interfere:

```
Rectangular: z = combine(trig(nπx)·trig(mπy), trig(mπx)·trig(nπy))
Circular:    z = combine(J_m(α·r)·trig(mθ), J_n(α·r)·trig(nθ))
```

| Option | Description |
|--------|-------------|
| M, N | Mode numbers controlling pattern complexity |
| Superposition | How terms combine (see below) |
| Amplitude | Output scale (visible when contours > 1) |
| Boundary | free=cos (edges move), fixed=sin (edges clamped) |
| Domain | centered=[0,1], tiled=[-1,1] (rectangular only) |

**Superposition modes** are defined in `config.js`. Each has:

| Property | Purpose |
|----------|---------|
| `combine(t1, t2)` | How to merge the two terms |
| `terms(ctx)` | Optional custom term computation (used by `rings`) |
| `scale` | Amplitude adjustment per shape type |
| `contours` | Contour level adjustment per shape type |

### Harmonic

Multi-mode sum with decay weighting. Sums many modes together:

```
Rectangular: z = Σ Σ weight · trig(jπx)·trig(kπy)
Circular:    z = Σ Σ weight · J_m(α·r)·cos(mθ)
```

| Option | Description |
|--------|-------------|
| Complexity | Number of modes to sum (1-10) |
| Decay | How quickly higher modes fall off (0-12) |
| Zoom | Pattern density / frequency |
| Boundary | free=cos, fixed=sin (rectangular only) |

### Excitation

Modal response to an initial displacement. This is our own creation - no reference implementations exist, so it's optimized for visual interest rather than strict physics.

| Option | Description |
|--------|-------------|
| Complexity | Modes to sum; maps to fold symmetry for circular (1→2-fold, 2→4-fold, etc.) |
| Zoom | Pattern density / frequency |
| Spread | Mode decay rate (1-9) |
| Excitation | dome, mosaic, or cell (rectangular only) |
| Position | Excitation point location (cell only) |

**Excitation types** (rectangular):

| Type | Description |
|------|-------------|
| dome | Central bump; odd modes only |
| mosaic | Diagonal patterns (j ≠ k) |
| cell | Point excitation with position control |

## Circular Plates and Bessel Functions

Circular plates use Bessel functions of the first kind, J_n(x). The `bessel` npm package computes these. Nodal circles occur at the zeros of J_n, stored in `BESSEL_ZEROS[n][k]` (the k-th zero of J_n, 10 zeros for each of J_0 through J_10).

| Option | Interference | Harmonic / Excitation |
|--------|--------------|----------------------|
| Radial | Selects which Bessel zero (acts as zoom) | Controls how many radial modes to sum |

Circular always samples the [-1, 1] grid; points outside the unit circle return large values and are excluded from contours.

## References

- [marching-squares](https://github.com/smallsaucepan/marching-squares) - Contour extraction library
- [Chladni Figure (Wikipedia)](https://en.wikipedia.org/wiki/Chladni_figure)
