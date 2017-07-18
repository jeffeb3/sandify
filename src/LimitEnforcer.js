import { Vertex } from './Geometry';
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

// This method is the guts of logic for this limits enforcer. It will take a single line (defined by
// start and end) and if the line goes out of bounds, returns the vertices around the outside edge
// to follow around without messing up the shape of the vertices.
//
function clipLine(line_start, line_end, size_x, size_y) {

  var quadrant_start = pointLocation(line_start, size_x, size_y);
  var quadrant_end = pointLocation(line_end, size_x, size_y);

  if (quadrant_start === 0b0000 && quadrant_end === 0b0000) {
    // The line is inside the boundaries
    return [line_start, line_end];
  }

  if (quadrant_start === quadrant_end) {
    // We are in the same box, and we are out of bounds.
    return [nearestVertex(line_start, size_x, size_y), nearestVertex(line_end, size_x, size_y)];
  }

  if (quadrant_start & quadrant_end) {
    // These points are all on one side of the box.
    return [nearestVertex(line_start, size_x, size_y), nearestVertex(line_end, size_x, size_y)];
  }

  if (quadrant_start === 0b000) {
    // We are exiting the box. Return the start, the intersection with the boundary, and the closest
    // boundary point to the exited point.
    var line = [line_start];
    line.push(boundPoint(line_start, line_end, size_x, size_y));
    line.push(nearestVertex(line_end, size_x, size_y));
    return line;
  }

  if (quadrant_end === 0b000) {
    // We are re-entering the box.
    return [boundPoint(line_end, line_start, size_x, size_y), line_end];
  }

  // We have reached a terrible place, where both points are oob, but it might intersect with the
  // work area.

  // First, define the boundaries as lines.
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

  // Count up the number of boundary lines intersect with our line segment.
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
      // We should never get here. How would we have something other than 2 or 0 intersections with
      // a box?
      console.log(intersections);
      throw Error("Software Geometry Error");
    }

    // The intersections are tested in some normal order, but the line could be going through them
    // in any direction. This check will flip the intersections if they are reversed somehow.
    if (Victor.fromObject(intersections[0]).subtract(Victor.fromObject(line_start)).lengthSq() >
        Victor.fromObject(intersections[1]).subtract(Victor.fromObject(line_start)).lengthSq()) {
      var temp = intersections[0];
      intersections[0] = intersections[1];
      intersections[1] = temp;
    }
    return intersections;
  }

  // Damn. We got here because we have a start and end that are failing different boundary checks,
  // and the line segment doesn't intersect the box. We have to crawl around the outside of the
  // box until we reach the other point.
  //
  // Here, I'm going to split this line into two parts, and send each half line segment back
  // through the clipLine algorithm. Eventually, that should result in only one of the other cases.
  var midpoint = Victor.fromObject(line_start).add(Victor.fromObject(line_end)).multiply(Victor(0.5, 0.5));
  // recurse, and find smaller segments until we don't end up in this place again.
  return [...clipLine(line_start, midpoint, size_x, size_y),
          ...clipLine(midpoint,   line_end, size_x, size_y)];
}

// Finds the nearest vertex that is in the bounds. This will change the shape. i.e. this doesn't
// care about the line segment, only about the point.
function nearestVertex(vertex, size_x, size_y) {
  return Vertex(Math.min(size_x, Math.max(-size_x, vertex.x)),
                Math.min(size_y, Math.max(-size_y, vertex.y)));
}

// Intersect the line with the boundary, and return the point exactly on the boundary.
// This will keep the shape. i.e. It will follow the line segment, and return the point on that line
// segment.
function boundPoint(good, bad, size_x, size_y) {
  var dx = good.x - bad.x;
  var dy = good.y - bad.y;

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

// Manipulates the points to make them all in bounds, while doing the least amount of damage to the
// desired shape.
function enforceLimits(vertices, size_x, size_y) {
  var cleanVertices = []
  var previous = null;

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
  var cleanerVertices = []
  for (var i=0; i<cleanVertices.length; i++) {
    cleanerVertices.push(nearestVertex(cleanVertices[i], size_x, size_y));
  }

  return cleanerVertices;
}

export default enforceLimits
