
import { Vertex } from './Geometry';

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

// Tries to abuse the design as little as possible, but guarantees the points will all be within the
// limits of the machine. The limits are [-size_x,size_x],[-size_y,size_y]
//
// The basic idea of this algorithm is:
//   - Is the point out of bounds (oob)?
//     - Yes, then:
//       - Find the point along the line that intersects with the boundary (boundPoint). Add in that
//       point
//       - If the oob point is exiting at a corner, then insert the corner point.
//       - Next loop, find the point along the next line that comes from the oob point to the next
//       point. Add in that point.
//     - No, then:
//       - Keep that point.
//   - After preserving the shape as much as possible with the above, there are still some strange
//   cases where it will fail, like if the line segment is from oob left to oob right, so just clip
//   those to the nearestPoint.
function enforceLimits(vertices, size_x, size_y) {
  var cleanVertices = []
  var previous = null;
  var previous_oob = false;
  for (var next=0; next<vertices.length; next++) {
    var vertex = vertices[next];

    // If there was a previous OOB point, then find the point that intersects with the limit.
      // What if there are two limits? We might need some way to bail? Maybe just find the nearest
      // this time.
    // Determine if the vertex is OOB.
    // If it is, then calculate the mx+b
      // calculate the intersect with the limit
      // calculate the "nearest" point
      // cache the desired point, so that next time, it can be extended.
      //
    if (previous) {
      if (previous_oob) {
        if (outOfBounds(vertex)) {
          // both previous and this point are out of bounds, don't try to find the boundPoint.
          cleanVertices.push(nearestVertex(previous, size_x, size_y));
        } else {
          // We are coming back into frame. Insert a point on the border.
          cleanVertices.push(boundPoint(vertex, previous, size_x, size_y));
        }
      }

      if (outOfBounds(vertex)) {
        // save the vertex along the line towards the border.
        cleanVertices.push(boundPoint(previous, vertex, size_x, size_y));
        previous_oob = true;
        // Insert another point at the corners, if we have exited out the corners.
        if ((vertex.x < -size_x || vertex.x > size_x) &&
            (vertex.y < -size_y || vertex.y > size_y)) {
          cleanVertices.push(nearestVertex(vertex, size_x, size_y));
        }
      } else {
        cleanVertices.push(vertex);
        previous_oob = false;
      }
    } else {
      cleanVertices.push(vertex);
    }
    previous = vertex;
  }

  // Just for sanity, and cases that I haven't thought of, clean this list again.
  var cleanerVertices = []
  for (var i=0; i<cleanVertices.length; i++) {
    cleanerVertices.push(nearestVertex(cleanVertices[i], size_x, size_y));
  }

  return cleanerVertices;
}

export default enforceLimits
