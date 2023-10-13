import KDBush from "kdbush"

// O(n); returns the point in arr that is farthest from a given point
export const farthest = (arr, point) => {
  return arr.reduce(
    (max, x, i, arr) => (x.distance(point) > max.distance(point) ? x : max),
    arr[0],
  )
}

// O(n); returns the point in arr that is closest to a given point
export const closest = (arr, point) => {
  return arr.reduce(
    (max, x, i, arr) => (x.distance(point) < max.distance(point) ? x : max),
    arr[0],
  )
}

// O(n log n); returns the point in arr1 that is closest to any point in arr2
export const nearestNeighbor = (arr1, arr2, radius = 1) => {
  const index = new KDBush(arr2.length)

  arr2.forEach((point) => index.add(point.x, point.y))
  index.finish()

  let minDistance = Infinity
  let closestPoint

  arr1.forEach((point) => {
    // find the nearest neighbor in arr2 to point
    const neighborIds = index.within(point.x, point.y, radius)
    const neighbor = arr2[neighborIds[0]]

    if (neighbor) {
      // calculate the Euclidean distance between the point and the nearest neighbor
      const distance = Math.sqrt(
        (point.x - neighbor.x) ** 2 + (point.y - neighbor.y) ** 2,
      )

      if (distance < minDistance) {
        minDistance = distance
        closestPoint = point
      }
    }
  })

  return closestPoint
}
