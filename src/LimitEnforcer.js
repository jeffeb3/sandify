import Vertex from './Geometry';
import Victor from 'victor';

// Determines which of 8 neighbor areas the point is in:
//   https://stackoverflow.com/questions/3746274/line-intersection-with-aabb-rectangle
//
//           |          |
//   0b1001  |  0b0001  |  0b0101
//           |          |
// ------------------------------ y_max
//           |          |
//   0b1000  |  0b0000  |  0b0100
//           |          |
// ------------------------------ y_min
//           |          |
//   0b1010  |  0b0010  |  0b0110
//           |          |
//         x_min      x_max
//
function pointLocation(point, size_x, size_y) {
  var location = 0b0;
  if (point.x < -size_x) {
    location += 0b1000;
  } else if (point.x > size_x) {
    location += 0b0100;
  }

  if (point.y < -size_y) {
    location += 0b0001;
  } else if (point.y > size_y) {
    location += 0b0010;
  }

  return location;
}

// Determine intersection with one of the sides
function intersection(line_start, line_end, side_start, side_end) {

  var line = line_end.clone().subtract(line_start);
  var side = side_end.clone().subtract(side_start);
  var lineCrossSidePerp = line.x * side.y - line.y * side.x;

  // if line Cross side === 0, it means the lines are parallel so have infinite intersection points
  if (lineCrossSidePerp === 0) {
    return null;
  }

  var diff = side_start.clone().subtract(line_start);
  var t = (diff.x * side.y - diff.y * side.x) / lineCrossSidePerp;
  if (t < 0 || t >= 1) {
    return null;
  }

  var u = (diff.x * line.y - diff.y * line.x) / lineCrossSidePerp;
  if (u < 0 || u >= 1) {
    return null;
  }

  var intersection = line_start.clone().add(line.clone().multiply(Victor(t, t)));
  return intersection;
}

function clipLine(line_start, line_end, size_x, size_y) {

  var quadrant_start = pointLocation(line_start, size_x, size_y);
  var quadrant_end = pointLocation(line_end, size_x, size_y);

  if (quadrant_start === 0b0000 && quadrant_end === 0b0000) {
    // The line is inside the boundaries
    return [line_start, line_end];
  }

  if (quadrant_start === quadrant_end) {
    // We are in the same box, and we are out of bounds.
    console.log('stay')
    return [nearestVertex(line_start, size_x, size_y), nearestVertex(line_end, size_x, size_y)];
  }

  if (quadrant_start & quadrant_end) {
    console.log('one side')
    // These points are all on one side of the box.
    return [nearestVertex(line_start, size_x, size_y), nearestVertex(line_end, size_x, size_y)];
  }

  if (quadrant_start === 0b000) {
    console.log('leaving')
    // We are exiting the box.
    var line = [line_start];
    line.push(boundPoint(line_start, line_end, size_x, size_y));
    line.push(nearestVertex(line_end, size_x, size_y));
    return line;
  }

  if (quadrant_end === 0b000) {
    console.log('returning')
    // We are re-entering the box.
    return [boundPoint(line_end, line_start, size_x, size_y), line_end];
  }

  // We have reached a terrible place, where both points are oob, but it might intersect with the
  // work area.
  const sides = [
    // left
    [Victor(-size_x, -size_y), Victor(-size_x, size_y)],
    // right
    [Victor(size_x, -size_y), Victor(size_x, size_y)],
    // bottom
    [Victor(-size_x, -size_y), Victor(size_x, -size_y)],
    // top
    [Victor(-size_x, size_y), Victor(size_x, size_y)],
  ]

  var intersections = []
  for (var s=0; s<sides.length; s++) {
    var int_point = intersection(Victor.fromObject(line_start),
                                 Victor.fromObject(line_end),
                                 sides[s][0],
                                 sides[s][1]);
    if (int_point) {
      intersections.push(Vertex(int_point.x, int_point.y));
    }
  }

  if (intersections.length !== 0) {
    if (intersections.length !== 2) {
      // We should never get here
      console.log(intersections);
      throw Error("Software Geometry Error");
    }
    console.log('through');

    // Determine if they are in the right order.
    if (Victor.fromObject(intersections[0]).subtract(Victor.fromObject(line_start)) >
        Victor.fromObject(intersections[1]).subtract(Victor.fromObject(line_start))) {
      var temp = intersections[0];
      intersections[0] = intersections[1];
      intersections[1] = temp;
      console.log("swapped");
    }
    return intersections;
  }

  // We might need to insert some corner points...
  console.log('give up');
  return [nearestVertex(line_start, size_x, size_y), nearestVertex(line_end, size_x, size_y)];
}

// Finds the nearest vertex that is in the bounds.
function nearestVertex(vertex, size_x, size_y) {
  return Vertex(Math.min(size_x, Math.max(-size_x, vertex.x)),
                Math.min(size_y, Math.max(-size_y, vertex.y)));
}

// Determines of a point is in bounds or out.
function outOfBounds(vertex, size_x, size_y) {
  return (vertex.x < -size_x || vertex.x > size_x ||
          vertex.y < -size_y || vertex.y > size_y);
}

// Find the point on the line defined by these two vertices that is exactly within the limits.
function boundPoint(good, bad, size_x, size_y) {
  var dx = good.x - bad.x;
  var dy = good.y - bad.y;

  if (outOfBounds(good)) {
    console.log('===================');
    console.log(good);
    console.log(bad);
  }
  var fixed = Vertex(bad.x, bad.y);
  var distance = 0;
  if (bad.x < -size_x || bad.x > size_x) {
    if (bad.x < -size_x) {
      // we are leaving the left
      fixed.x = -size_x;
    } else {
      // we are leaving the right
      fixed.x = size_x;
    }
    distance = (fixed.x - good.x) / dx;
    fixed.y = good.y + distance * dy;
    // We fixed x, but y might have the same problem, so we'll rerun this, with different points.
    return boundPoint(good, fixed, size_x, size_y);
  }
  if (bad.y < -size_y || bad.y > size_y) {
    if (bad.y < -size_y) {
      // we are leaving the bottom
      fixed.y = -size_y;
    } else {
      // we are leaving the top
      fixed.y = size_y;
    }
    distance = (fixed.y - good.y) / dy;
    fixed.x = good.x + distance * dx;
  }
  return fixed;
}

function enforceLimits(vertices, size_x, size_y) {
  var cleanVertices = []
  var previous = null;
  console.log('=============');
  for (var next=0; next<vertices.length; next++) {
    var vertex = vertices[next];
    if (previous) {
      var line = clipLine(previous, vertex, size_x, size_y);
      for (var pt=0; pt<line.length; pt++) {
        if (line[pt] !== previous) {
          cleanVertices.push(line[pt]);
        }
      }
    } else {
      cleanVertices.push(nearestVertex(vertex, size_x, size_y));
    }
    previous = vertex;
  }

  // // Just for sanity, and cases that I haven't thought of, clean this list again.
  // var cleanerVertices = []
  // for (var i=0; i<cleanVertices.length; i++) {
  //   cleanerVertices.push(nearestVertex(cleanVertices[i], size_x, size_y));
  // }

  return cleanVertices;
}

export default enforceLimits
