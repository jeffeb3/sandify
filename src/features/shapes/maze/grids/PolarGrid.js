import Victor from "victor"

// Polar grid for circular mazes
// Cells are arranged in concentric rings, with ring 0 being a single center cell
// Outer rings can have more wedges (doubling) to maintain proportional cell sizes

export default class PolarGrid {
  constructor(
    ringCount,
    baseWedgeCount,
    doublingInterval,
    rng,
    useArcs = false,
  ) {
    this.gridType = "polar"
    this.ringCount = ringCount
    this.baseWedgeCount = baseWedgeCount
    this.doublingInterval = doublingInterval
    this.rng = rng
    this.useArcs = useArcs

    // Build the grid structure
    // rings[r] = array of cells at ring r
    // Each cell: { ring, wedge, links: Set of "ring,wedge" keys }
    this.rings = []

    // Ring 0: single center cell
    this.rings[0] = [this.createCell(0, 0)]

    // Outer rings with wedge doubling
    for (let r = 1; r <= ringCount; r++) {
      const wedgeCount = this.getWedgeCount(r)

      this.rings[r] = []
      for (let w = 0; w < wedgeCount; w++) {
        this.rings[r][w] = this.createCell(r, w)
      }
    }

    // Mark a random cell as visited (for algorithm initialization)
    const startRing = Math.floor(rng() * (ringCount + 1))
    const startWedge = Math.floor(rng() * this.rings[startRing].length)

    this.rings[startRing][startWedge].visited = true
  }

  createCell(ring, wedge) {
    return {
      ring,
      wedge,
      links: new Set(),
      visited: false,
    }
  }

  // Ring 0 always has 1 cell
  // Wedge count doubles every `doublingInterval` rings
  getWedgeCount(ring) {
    if (ring === 0) return 1

    const doublings = Math.floor((ring - 1) / this.doublingInterval)

    return this.baseWedgeCount * Math.pow(2, doublings)
  }

  getCell(ring, wedge) {
    if (ring < 0 || ring > this.ringCount) return null

    const cells = this.rings[ring]

    if (!cells || wedge < 0 || wedge >= cells.length) return null

    return cells[wedge]
  }

  getAllCells() {
    const cells = []

    for (let r = 0; r <= this.ringCount; r++) {
      for (const cell of this.rings[r]) {
        cells.push(cell)
      }
    }

    return cells
  }

  getRandomCell() {
    const allCells = this.getAllCells()

    return allCells[Math.floor(this.rng() * allCells.length)]
  }

  getNeighbors(cell) {
    const { ring, wedge } = cell
    const neighbors = []
    const wedgesInThisRing = this.rings[ring].length

    // Center cell (ring 0) only has outward neighbors
    if (ring === 0) {
      // All cells in ring 1 are neighbors of center
      for (const outerCell of this.rings[1]) {
        neighbors.push(outerCell)
      }

      return neighbors
    }

    // Clockwise neighbor (same ring, next wedge with wraparound)
    const cwWedge = (wedge + 1) % wedgesInThisRing

    neighbors.push(this.rings[ring][cwWedge])

    // Counter-clockwise neighbor (same ring, previous wedge with wraparound)
    const ccwWedge = (wedge - 1 + wedgesInThisRing) % wedgesInThisRing

    neighbors.push(this.rings[ring][ccwWedge])

    // Inward neighbor(s)
    if (ring > 0) {
      const innerWedgeCount = this.rings[ring - 1].length

      if (ring === 1) {
        // Ring 1 cells all connect to center
        neighbors.push(this.rings[0][0])
      } else {
        // Map this wedge to inner ring wedge
        const ratio = wedgesInThisRing / innerWedgeCount
        const innerWedge = Math.floor(wedge / ratio)

        neighbors.push(this.rings[ring - 1][innerWedge])
      }
    }

    // Outward neighbor(s)
    if (ring < this.ringCount) {
      const outerWedgeCount = this.rings[ring + 1].length
      const ratio = outerWedgeCount / wedgesInThisRing

      if (ratio === 1) {
        // 1-to-1 mapping
        neighbors.push(this.rings[ring + 1][wedge])
      } else {
        // 1-to-many mapping (this cell connects to multiple outer cells)
        const firstOuterWedge = wedge * ratio

        for (let i = 0; i < ratio; i++) {
          neighbors.push(this.rings[ring + 1][firstOuterWedge + i])
        }
      }
    }

    return neighbors
  }

  cellKey(cell) {
    return `${cell.ring},${cell.wedge}`
  }

  link(cell1, cell2) {
    cell1.links.add(this.cellKey(cell2))
    cell2.links.add(this.cellKey(cell1))
  }

  unlink(cell1, cell2) {
    cell1.links.delete(this.cellKey(cell2))
    cell2.links.delete(this.cellKey(cell1))
  }

  isLinked(cell1, cell2) {
    return cell1.links.has(this.cellKey(cell2))
  }

  markVisited(cell) {
    cell.visited = true
  }

  isVisited(cell) {
    return cell.visited
  }

  cellEquals(cell1, cell2) {
    return cell1.ring === cell2.ring && cell1.wedge === cell2.wedge
  }

  extractWalls() {
    const walls = []
    const vertexCache = new Map()

    // Helper to create/reuse vertices (ensures exact same object for same coords)
    const makeVertex = (r, angle) => {
      const x = Math.round(r * Math.cos(angle) * 1000000) / 1000000
      const y = Math.round(r * Math.sin(angle) * 1000000) / 1000000
      const key = `${x},${y}`

      if (!vertexCache.has(key)) {
        vertexCache.set(key, new Victor(x, y))
      }

      return vertexCache.get(key)
    }

    // 1. RADIAL WALLS (between adjacent wedges in the same ring)
    for (let r = 1; r <= this.ringCount; r++) {
      const wedgeCount = this.rings[r].length
      const anglePerWedge = (Math.PI * 2) / wedgeCount
      const innerRadius = r
      const outerRadius = r + 1

      for (let w = 0; w < wedgeCount; w++) {
        const cell = this.rings[r][w]
        const cwWedge = (w + 1) % wedgeCount
        const cwNeighbor = this.rings[r][cwWedge]

        // Wall between this cell and clockwise neighbor
        if (!this.isLinked(cell, cwNeighbor)) {
          const angle = (w + 1) * anglePerWedge
          walls.push([
            makeVertex(innerRadius, angle),
            makeVertex(outerRadius, angle),
          ])
        }
      }
    }

    // Add arc or segment wall based on useArcs setting
    const addArcWall = (radius, startAngle, endAngle) => {
      if (this.useArcs) {
        const resolution = (Math.PI * 2.0) / 128.0
        const deltaAngle = endAngle - startAngle
        const numSteps = Math.ceil(deltaAngle / resolution)
        const points = []

        for (let step = 0; step <= numSteps; step++) {
          const t = step / numSteps
          const angle = startAngle + t * deltaAngle
          points.push(makeVertex(radius, angle))
        }

        for (let i = 0; i < points.length - 1; i++) {
          walls.push([points[i], points[i + 1]])
        }
      } else {
        walls.push([
          makeVertex(radius, startAngle),
          makeVertex(radius, endAngle),
        ])
      }
    }

    // 2. ARC WALLS (between rings)
    // Inner arc of each cell (boundary with inward neighbor)
    for (let r = 1; r <= this.ringCount; r++) {
      const wedgeCount = this.rings[r].length
      const anglePerWedge = (Math.PI * 2) / wedgeCount
      const radius = r // Inner edge of ring r is at radius r

      for (let w = 0; w < wedgeCount; w++) {
        const cell = this.rings[r][w]
        const startAngle = w * anglePerWedge
        const endAngle = (w + 1) * anglePerWedge

        let inwardNeighbor

        if (r === 1) {
          inwardNeighbor = this.rings[0][0]
        } else {
          const innerWedgeCount = this.rings[r - 1].length
          const ratio = wedgeCount / innerWedgeCount
          const innerWedge = Math.floor(w / ratio)

          inwardNeighbor = this.rings[r - 1][innerWedge]
        }

        // Wall if not linked to inward neighbor
        if (!this.isLinked(cell, inwardNeighbor)) {
          addArcWall(radius, startAngle, endAngle)
        }
      }
    }

    // 3. OUTER PERIMETER (always walls)
    const outerRing = this.ringCount
    const outerWedgeCount = this.rings[outerRing].length
    const outerAnglePerWedge = (Math.PI * 2) / outerWedgeCount
    const outerRadius = this.ringCount + 1

    for (let w = 0; w < outerWedgeCount; w++) {
      const startAngle = w * outerAnglePerWedge
      const endAngle = (w + 1) * outerAnglePerWedge

      addArcWall(outerRadius, startAngle, endAngle)
    }

    return walls
  }
}
