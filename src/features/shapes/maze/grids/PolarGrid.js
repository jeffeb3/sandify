/* global console */
import Grid from "./Grid"

// Polar grid for circular mazes
// Cells are arranged in concentric rings, with ring 0 being a single center cell
// Outer rings can have more wedges (doubling) to maintain proportional cell sizes

export default class PolarGrid extends Grid {
  constructor(
    ringCount,
    baseWedgeCount,
    doublingInterval,
    rng,
    useArcs = false,
  ) {
    super()
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

  cellEquals(cell1, cell2) {
    return cell1.ring === cell2.ring && cell1.wedge === cell2.wedge
  }

  // Get the center point of a cell (for solution path drawing)
  getCellCenter(cell) {
    const { ring, wedge } = cell

    // Ring 0 is the center cell
    if (ring === 0) {
      return { x: 0, y: 0 }
    }

    const wedgeCount = this.rings[ring].length
    const anglePerWedge = (Math.PI * 2) / wedgeCount
    const radius = ring + 0.5
    const angle = (wedge + 0.5) * anglePerWedge

    return {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
    }
  }

  // Get cells on the outer ring (perimeter) with their exit directions
  getEdgeCells() {
    const edgeCells = []
    const outerRing = this.ringCount

    for (const cell of this.rings[outerRing]) {
      edgeCells.push({ cell, direction: "out", edge: "out" })
    }

    return edgeCells
  }

  // Debug: dump maze structure
  dump() {
    let output = ""

    for (let r = 0; r <= this.ringCount; r++) {
      const wedgeCount = this.rings[r].length

      output += `Ring ${r} (${wedgeCount} wedge${wedgeCount > 1 ? "s" : ""}):\n`

      for (let w = 0; w < wedgeCount; w++) {
        const cell = this.rings[r][w]
        const links = Array.from(cell.links).sort().join(", ")

        output += `  [${r}:${w}] -> ${links || "(none)"}\n`
      }
    }

    console.log(output)

    return output
  }

  extractWalls() {
    const walls = []
    const vertexCache = new Map()
    const makeVertexXY = this.createMakeVertex(vertexCache)

    // Helper to create/reuse vertices from polar coords
    const makeVertex = (r, angle) => {
      const x = r * Math.cos(angle)
      const y = r * Math.sin(angle)

      return makeVertexXY(x, y)
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

    const addExitArcWithArrow = (cell, radius, startAngle, endAngle) => {
      const midAngle = (startAngle + endAngle) / 2

      // Draw arc in two halves (split at midpoint)
      if (this.useArcs) {
        const resolution = (Math.PI * 2.0) / 128.0

        // First half: startAngle to midAngle
        const delta1 = midAngle - startAngle
        const numSteps1 = Math.max(1, Math.ceil(delta1 / resolution))

        for (let step = 0; step < numSteps1; step++) {
          const t1 = step / numSteps1
          const t2 = (step + 1) / numSteps1
          const a1 = startAngle + t1 * delta1
          const a2 = startAngle + t2 * delta1

          walls.push([makeVertex(radius, a1), makeVertex(radius, a2)])
        }

        // Second half: midAngle to endAngle
        const delta2 = endAngle - midAngle
        const numSteps2 = Math.max(1, Math.ceil(delta2 / resolution))

        for (let step = 0; step < numSteps2; step++) {
          const t1 = step / numSteps2
          const t2 = (step + 1) / numSteps2
          const a1 = midAngle + t1 * delta2
          const a2 = midAngle + t2 * delta2

          walls.push([makeVertex(radius, a1), makeVertex(radius, a2)])
        }
      } else {
        // Straight segments split at midpoint
        walls.push([makeVertex(radius, startAngle), makeVertex(radius, midAngle)])
        walls.push([makeVertex(radius, midAngle), makeVertex(radius, endAngle)])
      }

      // Arrow at arc's angular midpoint
      const arcMidX = radius * Math.cos(midAngle)
      const arcMidY = radius * Math.sin(midAngle)

      // Tangent direction (perpendicular to radial, along the arc)
      const tangentX = -Math.sin(midAngle)
      const tangentY = Math.cos(midAngle)

      // Create virtual wall endpoints along tangent for arrow sizing
      // We want headWidth = 0.5, and addExitArrow uses headWidth = wallLen * 0.625
      // So wallLen = 0.5 / 0.625 = 0.8, half on each side = 0.4
      const halfWall = 0.4
      const x1 = arcMidX - tangentX * halfWall
      const y1 = arcMidY - tangentY * halfWall
      const x2 = arcMidX + tangentX * halfWall
      const y2 = arcMidY + tangentY * halfWall

      // Inward direction points toward center
      const inwardDx = -Math.cos(midAngle)
      const inwardDy = -Math.sin(midAngle)

      // Use base class arrow drawing (walls already split above, so just draw arrow)
      const arrow = this.addExitArrow(
        walls,
        makeVertexXY,
        x1,
        y1,
        x2,
        y2,
        cell.exitType,
        inwardDx,
        inwardDy,
      )

      cell.arrowEdges = arrow.edges
    }

    // 3. OUTER PERIMETER (always walls, with exits)
    const outerRing = this.ringCount
    const outerWedgeCount = this.rings[outerRing].length
    const outerAnglePerWedge = (Math.PI * 2) / outerWedgeCount
    const outerRadius = this.ringCount + 1

    for (let w = 0; w < outerWedgeCount; w++) {
      const cell = this.rings[outerRing][w]
      const startAngle = w * outerAnglePerWedge
      const endAngle = (w + 1) * outerAnglePerWedge

      if (cell.exitDirection === "out") {
        addExitArcWithArrow(cell, outerRadius, startAngle, endAngle)
      } else {
        addArcWall(outerRadius, startAngle, endAngle)
      }
    }

    return walls
  }
}
