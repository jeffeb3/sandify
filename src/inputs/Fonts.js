import { Vertex } from '../Geometry';



const font1Spacing = 1.5;

let Font1Data = {
  ' ': {
    max_x: 1.0,
    vertices: [
    ],
  },

  'A': {
    max_x: font1Spacing,
    vertices: [
      Vertex(0.0, 0.0),
      Vertex(0.0, 2.0),
      Vertex(1.0, 2.0),
      Vertex(1.0, 0.0),
      Vertex(1.0, 1.0),
      Vertex(0.0, 1.0),
      Vertex(0.0, 0.0),
    ],
  },
  'B': {
    max_x: font1Spacing,
    vertices: [
      Vertex(0.0, 0.0),
      Vertex(1.0, 0.0),
      Vertex(1.0, 1.0),
      Vertex(0.0, 1.0),
      Vertex(0.5, 1.0),
      Vertex(1.0, 2.0),
      Vertex(0.0, 2.0),
      Vertex(0.0, 0.0),
    ],
  },
  'D': {
    max_x: font1Spacing,
    vertices: [
      Vertex(0.0, 0.0),
      Vertex(0.5, 0.0),
      Vertex(0.5, 2.0),
      Vertex(0.0, 2.0),
      Vertex(1.0, 2.0),
      Vertex(1.0, 0.0),
      Vertex(0.0, 0.0),
    ],
  },
  'E': {
    max_x: font1Spacing,
    vertices: [
      Vertex(0.0, 0.0),
      Vertex(0.0, 2.0),
      Vertex(1.0, 2.0),
      Vertex(0.0, 2.0),
      Vertex(0.0, 1.0),
      Vertex(1.0, 1.0),
      Vertex(0.0, 1.0),
      Vertex(0.0, 0.0),
      Vertex(1.0, 0.0),
      Vertex(0.0, 0.0),
    ],
  },
  'F': {
    max_x: font1Spacing,
    vertices: [
      Vertex(0.0, 0.0),
      Vertex(0.0, 1.0),
      Vertex(1.0, 1.0),
      Vertex(0.0, 1.0),
      Vertex(0.0, 2.0),
      Vertex(1.0, 2.0),
      Vertex(0.0, 2.0),
      Vertex(0.0, 0.0),
    ],
  },
  'I': {
    max_x: font1Spacing,
    vertices: [
      Vertex(0.0, 0.0),
      Vertex(0.5, 0.0),
      Vertex(0.5, 2.0),
      Vertex(0.0, 2.0),
      Vertex(1.0, 2.0),
      Vertex(0.5, 2.0),
      Vertex(0.5, 0.0),
      Vertex(1.0, 0.0),
      Vertex(0.0, 0.0),
    ],
  },
  'N': {
    max_x: font1Spacing,
    vertices: [
      Vertex(0.0, 0.0),
      Vertex(0.0, 2.0),
      Vertex(1.0, 0.0),
      Vertex(1.0, 2.0),
      Vertex(1.0, 0.0),
      Vertex(0.0, 2.0),
      Vertex(0.0, 0.0),
    ],
  },
  'R': {
    max_x: font1Spacing,
    vertices: [
      Vertex(0.0, 0.0),
      Vertex(0.0, 1.0),
      Vertex(0.5, 1.0),
      Vertex(1.0, 0.0),
      Vertex(0.5, 1.0),
      Vertex(1.0, 1.0),
      Vertex(1.0, 2.0),
      Vertex(0.0, 2.0),
      Vertex(0.0, 0.0),
    ],
  },
  'S': {
    max_x: font1Spacing,
    vertices: [
      Vertex(0.0, 0.0),
      Vertex(1.0, 0.0),
      Vertex(1.0, 1.0),
      Vertex(0.5, 1.0),
      Vertex(0.0, 2.0),
      Vertex(1.0, 2.0),
      Vertex(0.0, 2.0),
      Vertex(0.5, 1.0),
      Vertex(1.0, 1.0),
      Vertex(1.0, 0.0),
      Vertex(0.0, 0.0),
    ],
  },
  'Y': {
    max_x: font1Spacing,
    vertices: [
      Vertex(0.5, 0.0),
      Vertex(0.5, 1.0),
      Vertex(0.0, 2.0),
      Vertex(0.5, 1.0),
      Vertex(1.0, 2.0),
      Vertex(0.5, 1.0),
      Vertex(0.5, 0.0),
    ],
  },
}

let Font1 = (ch) => {
  let upper = ch.toUpperCase();
  if (Font1Data.hasOwnProperty(upper)) {
    return Font1Data[upper];
  } else {
    return Font1Data[' '];
  }
}

export default Font1;
