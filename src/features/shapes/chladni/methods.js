import BESSEL from "bessel"
import { BESSEL_ZEROS, SUPERPOSITION, EXCITATION } from "./config"
import {
  defaultTerms,
  defaultScale,
  getEffectiveValue,
  toPolar,
} from "./helpers"

// Rectangular plate interference pattern
// Domain: [0, 1] or [-1, 1]
export function interferenceRectangular(x, y, opts) {
  const { m, n, superposition, amplitude, boundary } = opts
  const trig = boundary === "free" ? Math.cos : Math.sin
  const mode = SUPERPOSITION[superposition]
  const term1 = trig(n * Math.PI * x) * trig(m * Math.PI * y)
  const term2 = trig(m * Math.PI * x) * trig(n * Math.PI * y)
  const ctx = { term1, term2, m, n, x, y, trig, shape: "rectangular" }
  const [t1, t2] = (mode.terms || defaultTerms)(ctx)
  const scale = getEffectiveValue(
    mode,
    "scale",
    "rectangular",
    amplitude,
    defaultScale,
    4,
  )

  return mode.combine(t1, t2) * scale
}

// Circular plate interference pattern using Bessel functions
// m, n = angular mode numbers, radial = which Bessel zero to use
// Domain: x,y in [-1, 1], circular boundary at r=1
export function interferenceCircular(x, y, opts) {
  const { m, n, radial, superposition, amplitude, boundary } = opts
  const polar = toPolar(x, y)

  if (!polar) return 1000

  const { r, theta } = polar
  const trig = boundary === "free" ? Math.cos : Math.sin
  const mode = SUPERPOSITION[superposition]

  // Default terms: two different angular modes, same radial zero
  const alphaM = BESSEL_ZEROS[m][radial - 1]
  const alphaN = BESSEL_ZEROS[n][radial - 1]
  const term1 = BESSEL.besselj(alphaM * r, m) * trig(m * theta)
  const term2 = BESSEL.besselj(alphaN * r, n) * trig(n * theta)
  const ctx = { term1, term2, m, n, r, theta, trig, shape: "circular" }
  const [t1, t2] = (mode.terms || defaultTerms)(ctx)
  const scale = getEffectiveValue(
    mode,
    "scale",
    "circular",
    amplitude,
    defaultScale,
    4,
  )

  return mode.combine(t1, t2) * scale
}

// Harmonic rectangular: sum many modes
// Uses full [-1,1] range internally so sin/cos oscillates through +/-
// frequency scales all harmonics (zoom), modes controls complexity
export function harmonicRectangular(x, y, opts) {
  const { modes, decay, frequency, boundary } = opts
  const trig = boundary === "free" ? Math.cos : Math.sin
  const scaledFreq = frequency * 1.5 - 1
  const decayExp = (decay + 1) / 8

  // Map to [-1,1] so trig functions cross zero
  const cx = x * 2 - 1
  const cy = y * 2 - 1
  let sum = 0

  for (let j = 1; j <= modes; j++) {
    for (let k = 1; k <= modes; k++) {
      const weight = 1 / Math.pow(j + k, decayExp)

      sum +=
        weight *
        trig(j * Math.PI * scaledFreq * cx) *
        trig(k * Math.PI * scaledFreq * cy)
    }
  }

  return sum
}

// Harmonic circular: sum Bessel modes with decay
// z = Σ Σ weight · J_m(α_mn·r)·cos(mθ) for angular modes m and radial modes n
// modes controls angular complexity, radial controls radial complexity
export function harmonicCircular(x, y, opts) {
  let { modes, radial, decay, frequency } = opts
  const polar = toPolar(x, y)

  if (!polar) return 1000

  const { r, theta } = polar
  const scaledFreq = frequency * 1.5
  const decayExp = (decay + 1) / 16
  let sum = 0

  modes = modes + 1 // boost for circular

  // Loop over angular modes (m) and radial modes (n)
  // m=0 gives concentric circles, m>0 adds angular variation
  // n selects which Bessel zero (more zeros = more radial rings)
  for (let m = 0; m < modes && m < BESSEL_ZEROS.length; m++) {
    for (let n = 1; n <= radial && n <= BESSEL_ZEROS[m].length; n++) {
      const alpha = BESSEL_ZEROS[m][n - 1]
      const weight = 1 / Math.pow(m + n, decayExp)
      const radialTerm = BESSEL.besselj(alpha * r * scaledFreq, m)
      const angular = Math.cos(m * theta)

      sum += weight * radialTerm * angular
    }
  }

  return sum
}

// Excitation rectangular dome: separate function for odd-mode iteration
// Complexity maps directly to odd modes: 1→1, 2→3, 3→5, etc.
function excitationRectangularDome(x, y, spread, modes, frequency) {
  const freq = frequency * 1.5 - 0.5
  let sum = 0

  for (let jIdx = 0; jIdx < modes; jIdx++) {
    const j = jIdx * 2 + 1 // odd: 1, 3, 5, ...
    for (let kIdx = 0; kIdx < modes; kIdx++) {
      const k = kIdx * 2 + 1 // odd: 1, 3, 5, ...
      // Power-law decay: (1,1) normalized to 1, spread controls decay rate
      // Higher spread = slower decay = more high-mode contribution
      const modeEnergy = j * j + k * k
      const weight = Math.pow(2 / modeEnergy, 1 / spread)

      sum +=
        weight *
        Math.sin(j * Math.PI * freq * x) *
        Math.sin(k * Math.PI * freq * y)
    }
  }

  return sum
}

// Excitation rectangular: modal response to initial displacement
// Each excitation type has different modal weights
// Uses [0,1] domain matching interference "centered" mode
export function excitationRectangular(x, y, opts) {
  const { excitation, spread, position, frequency } = opts
  let { modes } = opts
  const modesFn = EXCITATION[excitation]?.modes?.rectangular

  modes = modesFn ? modesFn(modes) : modes

  if (excitation === "dome") {
    return excitationRectangularDome(x, y, spread, modes, frequency)
  }

  const spreadFactor = spread / 5
  const freq = frequency * 1.5 - 0.5
  let sum = 0

  for (let j = 1; j <= modes; j++) {
    for (let k = 1; k <= modes; k++) {
      let weight

      switch (excitation) {
        case "cell": {
          // Point excitation sweeping across plate
          // Position 0-10 maps to x₀ ∈ [0.1, 0.9] (avoiding edges where modes vanish)
          const x0 = 0.1 + position * 0.08
          const y0 = 0.55 // slight offset from center to break symmetry
          const posWeight =
            Math.sin(j * Math.PI * x0) * Math.sin(k * Math.PI * y0)
          // Gentler decay exponent, amplitude boost to compensate
          const decayFactor = Math.pow(spreadFactor, (j + k) / 8)

          weight = posWeight * decayFactor * 2
          break
        }

        case "mosaic":
          // Mosaic modes (j ≠ k) for diagonal patterns
          if (j === k) {
            weight = 0
          } else {
            weight = spreadFactor / (j + k)
          }
          break

        default:
          weight = 1 / (j + k)
      }

      sum +=
        weight *
        Math.sin(j * Math.PI * freq * x) *
        Math.sin(k * Math.PI * freq * y)
    }
  }

  return sum
}

// Excitation circular: modal response with Bessel functions
// Loops over angular modes (m) and radial modes (n)
export function excitationCircular(x, y, opts) {
  const { excitation, spread, position, modes, radial, frequency } = opts
  const polar = toPolar(x, y)

  if (!polar) return 1000

  const { r, theta } = polar
  const spreadFactor = spread / 5
  const freq = frequency * 2 - 1
  let sum = 0
  const loopModes = excitation === "mosaic" ? modes * 2 + 1 : modes

  for (let m = 0; m < loopModes && m < BESSEL_ZEROS.length; m++) {
    for (let n = 1; n <= radial && n <= BESSEL_ZEROS[m].length; n++) {
      const alpha = BESSEL_ZEROS[m][n - 1]
      let weight

      switch (excitation) {
        case "cell": {
          // Angular excitation - position controls angle around the plate
          // Position 0-10 maps to θ₀ ∈ [0, 2π]
          const theta0 = (position * Math.PI) / 5
          const r0 = 0.6 // fixed radius for excitation point

          weight =
            BESSEL.besselj(alpha * r0, m) *
            Math.cos(m * theta0) *
            Math.pow(spreadFactor, (m + n) / 16)
          break
        }

        case "dome":
          // Central dome: only m=0 (radially symmetric)
          weight = m === 0 ? (spreadFactor * 2) / n : 0
          break

        case "mosaic": {
          // Mosaic: modes controls fold symmetry (2-fold, 4-fold, 6-fold...)
          // modes=1 → m=2, modes=2 → m=4, modes=3 → m=6, etc.
          const dominantM = modes * 2

          if (m === dominantM) {
            weight = (spreadFactor * 2) / n
          } else if (m === 0) {
            weight = (spreadFactor * 0.3) / n
          } else {
            weight = 0
          }
          break
        }

        default:
          weight = 1 / (m + n)
      }

      const radialTerm = BESSEL.besselj(alpha * r * freq, m)
      const angular = Math.cos(m * theta)

      sum += weight * radialTerm * angular
    }
  }

  return sum
}

// Method dispatch: METHOD[method][shape](x, y, opts)
export const METHOD = {
  interference: {
    circular: interferenceCircular,
    rectangular: interferenceRectangular,
  },
  harmonic: {
    circular: harmonicCircular,
    rectangular: harmonicRectangular,
  },
  excitation: {
    circular: excitationCircular,
    rectangular: excitationRectangular,
  },
}
