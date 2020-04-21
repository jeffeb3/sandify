// L-system instructions for space filling curves

export const fillers = {
  // http://mathforum.org/advanced/robertd/lsys2d.html
  'Gosper (flowsnake)': {
    axiom: 'A',
    draw: ['A', 'B'],
    rules:  {
      A: 'A-B--B+A++AA+B-',
      B: '+A-BB--B-A++A+B'
    },
    angle: Math.PI / 3,
    orderGrow: true,
    maxOrder: 6
  },
  // http://mathforum.org/advanced/robertd/lsys2d.html
  'Hilbert': {
    axiom: 'L',
    draw: 'F',
    rules: {
      L: '+RF-LFL-FR+',
      R: '-LF+RFR+FL-'
    },
    startingAngle: Math.PI
  },
  // http://mathforum.org/advanced/robertd/lsys2d.html
  'Hilbert II': {
    axiom: 'X',
    draw: 'F',
    rules: {
      X: 'XFYFX+F+YFXFY-F-XFYFX',
      Y: 'YFXFY-F-XFYFX+F+YFXFY'
    },
    startingAngle: Math.PI,
    maxOrder: 4
  },

//  'Penrose Tile': {
//    axiom: '[7]++[7]++[7]++[7]++[7]',
//    draw: ['6', '7', '8', '9'],
//    rules: {
//      6: '8++9----7[-8----6]++',
//      7: '+8--9[---6--7]+',
//      8: '-6++7[+++8++9]-',
//      9: '--8++++6[+9++++7]--7'
//    },
//    angle: Math.PI/5
//  },

  // https://en.wikipedia.org/wiki/Sierpi%C5%84ski_curve
  'Sierpinski': {
    axiom: 'F--XF--F--XF',
    draw: ['F', 'G'],
    rules: {
      X: 'XF+G+XF--F--XF+G+X'
    },
    startingAngle: Math.PI/4,
    angle: Math.PI/4,
    maxOrder: 6
  },

  // https://en.wikipedia.org/wiki/Sierpi%C5%84ski_curve
  'Sierpinski Square': {
    axiom: 'F+XF+F+XF',
    draw: 'F',
    rules: {
      X: 'XF-F+F-XF+F+XF-F+F-X'
    },
    startingAngle: Math.PI/4,
    maxOrder: 6
  }
}
