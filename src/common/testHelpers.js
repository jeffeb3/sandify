import Victor from "victor"

// Create a square centered at origin (or specified center)
export const createSquare = (size = 50, center = { x: 0, y: 0 }) => {
  const half = size / 2
  return [
    new Victor(center.x - half, center.y - half),
    new Victor(center.x + half, center.y - half),
    new Victor(center.x + half, center.y + half),
    new Victor(center.x - half, center.y + half),
    new Victor(center.x - half, center.y - half), // close the path
  ]
}

// Create an equilateral triangle centered at origin
export const createTriangle = (size = 50, center = { x: 0, y: 0 }, closed = true) => {
  const height = (size * Math.sqrt(3)) / 2
  const vertices = [
    new Victor(center.x, center.y - (height * 2) / 3),          // top
    new Victor(center.x - size / 2, center.y + height / 3),     // bottom-left
    new Victor(center.x + size / 2, center.y + height / 3),     // bottom-right
  ]
  if (closed) {
    vertices.push(vertices[0].clone())
  }
  return vertices
}

// Create a 5-pointed star centered at origin
export const createStar = (outerRadius = 50, innerRadius = 20) => {
  const vertices = []
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2 // Start from top
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    vertices.push(
      new Victor(Math.cos(angle) * radius, Math.sin(angle) * radius),
    )
  }
  return vertices
}

// Create a figure-8 (lemniscate) shape
export const createFigure8 = (radius = 30) => {
  const vertices = []
  const segments = 32
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * 2 * Math.PI
    // Lemniscate of Bernoulli approximation
    const x = radius * Math.sin(t)
    const y = (radius / 2) * Math.sin(2 * t)
    vertices.push(new Victor(x, y))
  }
  return vertices
}

// Create an open L-shaped path (not closed)
export const createOpenPath = () => {
  return [
    new Victor(0, 0),
    new Victor(50, 0),
    new Victor(50, 30),
    new Victor(30, 30),
    new Victor(30, 50),
    new Victor(0, 50),
    // NOT closed - gap back to start
  ]
}

// Create a rectangle with a bump on the right side
// This simulates a wavy boundary to test perimeter tracing
export const createBumpyRect = (width = 100, height = 100, bumpSize = 20) => {
  const hw = width / 2
  const hh = height / 2
  const bh = bumpSize / 2
  return [
    new Victor(-hw, -hh),           // bottom-left
    new Victor(hw, -hh),            // bottom-right
    new Victor(hw, -bh),            // up to bump bottom
    new Victor(hw + bumpSize, -bh), // bump out
    new Victor(hw + bumpSize, bh),  // bump across
    new Victor(hw, bh),             // bump back
    new Victor(hw, hh),             // continue to top-right
    new Victor(-hw, hh),            // top-left
    new Victor(-hw, -hh),           // close
  ]
}

// Create a hexagon centered at origin
export const createHexagon = (radius = 50, center = { x: 0, y: 0 }) => {
  const vertices = []
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 - Math.PI / 2 // Start from top
    vertices.push(
      new Victor(
        center.x + Math.cos(angle) * radius,
        center.y + Math.sin(angle) * radius
      )
    )
  }
  vertices.push(vertices[0].clone()) // close
  return vertices
}

// Create a grid of small disconnected squares (fill pattern)
export const createFillPattern = (gridSize = 5, squareSize = 8, gap = 2) => {
  const vertices = []
  const step = squareSize + gap

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const x = col * step
      const y = row * step
      // Add each small square as a closed path
      vertices.push(new Victor(x, y))
      vertices.push(new Victor(x + squareSize, y))
      vertices.push(new Victor(x + squareSize, y + squareSize))
      vertices.push(new Victor(x, y + squareSize))
      vertices.push(new Victor(x, y))
    }
  }
  return vertices
}
