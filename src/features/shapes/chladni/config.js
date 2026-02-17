import BESSEL from "bessel"

// Zeros of Bessel function J_n(x) for circular plate modes
// BESSEL_ZEROS[n][k-1] = k-th zero of J_n
export const BESSEL_ZEROS = [
  [
    2.4048, 5.5201, 8.6537, 11.7915, 14.9309, 18.0711, 21.2116, 24.3525,
    27.4935, 30.6346,
  ], // J_0
  [
    3.8317, 7.0156, 10.1735, 13.3237, 16.4706, 19.6159, 22.7601, 25.9037,
    29.0468, 32.1897,
  ], // J_1
  [
    5.1356, 8.4172, 11.6198, 14.796, 17.9598, 21.117, 24.2701, 27.4206, 30.5692,
    33.7165,
  ], // J_2
  [
    6.3802, 9.761, 13.0152, 16.2235, 19.4094, 22.5827, 25.7482, 28.9084,
    32.0649, 35.2187,
  ], // J_3
  [
    7.5883, 11.0647, 14.3725, 17.616, 20.8269, 24.019, 27.1991, 30.371, 33.5371,
    36.699,
  ], // J_4
  [
    8.7715, 12.3386, 15.7002, 18.9801, 22.2178, 25.4303, 28.6266, 31.8117,
    34.9888, 38.1599,
  ], // J_5
  [
    9.9361, 13.5893, 17.0038, 20.3208, 23.5861, 26.8202, 30.0337, 33.233,
    36.422, 39.6032,
  ], // J_6
  [
    11.0864, 14.8213, 18.2876, 21.6415, 24.9349, 28.1912, 31.4228, 34.6371,
    37.8387, 41.0308,
  ], // J_7
  [
    12.2251, 16.0378, 19.5545, 22.9452, 26.2668, 29.5457, 32.7958, 36.0256,
    39.2404, 42.4439,
  ], // J_8
  [
    13.3543, 17.2412, 20.807, 24.2339, 27.5837, 30.8854, 34.1544, 37.4001,
    40.6286, 43.8438,
  ], // J_9
  [
    14.4755, 18.4335, 22.047, 25.5095, 28.8874, 32.2119, 35.4999, 38.7618,
    42.0042, 45.2316,
  ], // J_10
]

// Excitation modes: contour and mode adjustments per excitation type
export const EXCITATION = {
  cell: {
    contours: {
      rectangular: (value) => value + 2,
      circular: (value) => value + 2,
    },
    modes: {
      rectangular: (value) => value + 1,
      circular: (value) => value,
    },
  },
  dome: {
    contours: {
      rectangular: (value) => value + 2,
      circular: (value) => value + 2,
    },
  },
  mosaic: {
    modes: {
      rectangular: (value) => value + 2,
      circular: (value) => value + 2,
    },
    contours: {
      rectangular: (value) => value * 4,
      circular: (value) => value + 2,
    },
  },
}

// Superposition modes: terms() marshalls inputs, combine() merges them
// ctx contains: { term1, term2, m, n, x, y, r, theta, trig, shape }
export const SUPERPOSITION = {
  add: {
    combine: (t1, t2) => t1 + t2,
  },
  beat: {
    combine: (t1, t2) => (t1 + t2) * (t1 - t2),
    scale: {
      rectangular: 0.5,
      circular: (value) => (value + 1) * 10,
    },
  },
  difference: {
    combine: (t1, t2) => Math.abs(t1 - t2),
    scale: {
      rectangular: (value) => value + 4,
      circular: (value) => value + 4,
    },
    contours: {
      rectangular: (value) => value + 1,
      circular: (value) => value + 1,
    },
  },
  exclusion: {
    combine: (t1, t2) => t1 + t2 - 2 * t1 * t2,
  },
  grid: {
    combine: (t1, t2) => t1 * t2,
    scale: { rectangular: 2, circular: 24 },
  },
  hypot: {
    combine: (t1, t2) => Math.hypot(t1, t2),
    scale: {
      rectangular: (value) => value + 2,
      circular: (value) => value + 5,
    },
  },
  max: {
    combine: (t1, t2) => Math.max(t1, t2),
    scale: {
      rectangular: 1,
      circular: (value) => value + 6,
    },
  },
  min: {
    combine: (t1, t2) => Math.min(t1, t2),
    scale: {
      rectangular: (value) => value + 2,
      circular: (value) => value + 6,
    },
  },
  modulate: {
    combine: (t1, t2) => t1 * (1 + t2),
  },
  overlay: {
    combine: (t1, t2) => {
      // normalize to [0,1], apply overlay, back to [-1,1]
      const a = (t1 + 1) / 2
      const b = (t2 + 1) / 2
      const result = a <= 0.5 ? 2 * a * b : 1 - 2 * (1 - a) * (1 - b)

      return result * 2 - 1
    },
    scale: {
      rectangular: (value) => value + 2,
      circular: (value) => value + 4,
    },
  },
  rings: {
    terms: (ctx) => {
      if (ctx.shape === "circular") {
        const alpha1 = BESSEL_ZEROS[ctx.m][0]
        const alpha2 =
          BESSEL_ZEROS[ctx.m][Math.min(ctx.n, BESSEL_ZEROS[ctx.m].length) - 1]

        return [
          BESSEL.besselj(alpha1 * ctx.r, ctx.m) * ctx.trig(ctx.m * ctx.theta),
          BESSEL.besselj(alpha2 * ctx.r, ctx.m) * ctx.trig(ctx.m * ctx.theta),
        ]
      } else {
        return [
          ctx.trig(ctx.m * Math.PI * ctx.x) * ctx.trig(ctx.m * Math.PI * ctx.y),
          ctx.trig(ctx.n * Math.PI * ctx.x) * ctx.trig(ctx.n * Math.PI * ctx.y),
        ]
      }
    },
    combine: (t1, t2) => t1 - t2,
    scale: {
      rectangular: 1,
      circular: (value) => value + 5,
    },
  },
  screen: {
    combine: (t1, t2) => t1 + t2 - t1 * t2,
  },
  subtract: {
    combine: (t1, t2) => t1 - t2,
  },
}
