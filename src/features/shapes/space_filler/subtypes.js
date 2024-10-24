// L-system instructions for space filling curves
export const subtypes = {
  // http://mathforum.org/advanced/robertd/lsys2d.html
  "Gosper (flowsnake)": {
    axiom: "A",
    draw: ["A", "B"],
    rules: {
      A: "A-B--B+A++AA+B-",
      B: "+A-BB--B-A++A+B",
    },
    angle: Math.PI / 3,
    iterationsGrow: (config) => {
      return config.iterations
    },
    maxIterations: 6,
  },
  // http://mathforum.org/advanced/robertd/lsys2d.html
  Hilbert: {
    axiom: "L",
    draw: "F",
    rules: {
      L: "+RF-LFL-FR+",
      R: "-LF+RFR+FL-",
    },
    startingAngle: Math.PI,
    minIterations: 2,
  },
  // http://mathforum.org/advanced/robertd/lsys2d.html
  "Hilbert 2": {
    axiom: "X",
    draw: "F",
    rules: {
      X: "XFYFX+F+YFXFY-F-XFYFX",
      Y: "YFXFY-F-XFYFX+F+YFXFY",
    },
    startingAngle: Math.PI,
    maxIterations: 4,
  },
  // https://en.wikipedia.org/wiki/Sierpi%C5%84ski_curve
  Sierpinski: {
    axiom: "F--XF--F--XF",
    draw: ["F", "G"],
    rules: {
      X: "XF+G+XF--F--XF+G+X",
    },
    startingAngle: Math.PI / 4,
    angle: Math.PI / 4,
    maxIterations: 6,
  },
  // https://onlinemathtools.com/l-system-generator
  "Penrose Tile": {
    axiom: "[7]++[7]++[7]++[7]++[7]",
    draw: ["6", "7", "8", "9"],
    rules: {
      6: "8++9----7[-8----6]++",
      7: "+8--9[---6--7]+",
      8: "-6++7[+++8++9]-",
      9: "--8++++6[+9++++7]--7",
    },
    angle: Math.PI / 5,
    maxIterations: 5,
    shortestPath: 5,
    iterationsGrow: (config) => {
      return 1 + Math.max(1, 3 / config.iterations)
    },
  },
  // https://en.wikipedia.org/wiki/Sierpi%C5%84ski_curve
  "Sierpinski Square": {
    axiom: "F+XF+F+XF",
    draw: "F",
    rules: {
      X: "XF-F+F-XF+F+XF-F+F-X",
    },
    startingAngle: Math.PI / 4,
    maxIterations: 6,
  },
}
