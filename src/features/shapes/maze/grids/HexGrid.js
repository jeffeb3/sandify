import Victor from "victor"

// Hexagonal grid for hex mazes
// Uses pointy-top orientation with odd-r offset coordinates

export default class HexGrid {
  constructor(width, height, rng) {
    this.gridType = "hex"
    this.width = width
    this.height = height
    this.rng = rng

    this.xOffset = Math.sin(Math.PI / 3) // ~0.866
    this.yOffset1 = Math.cos(Math.PI / 3) // ~0.5
    this.yOffset2 = 2 - this.yOffset1 // ~1.5

    const rawWidth = (2 * width + 1) * this.xOffset
    const rawHeight = height * this.yOffset2 + this.yOffset1

    this.yScale = rawWidth / rawHeight
    this.cells = []

    for (let r = 0; r < height; r++) {
      for (let q = 0; q < width; q++) {
        this.cells.push(this.createCell(q, r))
      }
    }

    const startIndex = Math.floor(rng() * this.cells.length)

    this.cells[startIndex].visited = true
  }

  createCell(q, r) {
    return {
      q,
      r,
      links: new Set(),
      visited: false,
    }
  }

  getCell(q, r) {
    if (q < 0 || q >= this.width || r < 0 || r >= this.height) return null

    return this.cells[r * this.width + q]
  }

  getAllCells() {
    return this.cells
  }

  getRandomCell() {
    return this.cells[Math.floor(this.rng() * this.cells.length)]
  }

  getRowOffset(r) {
    return (r + 1) % 2
  }

  getNeighbors(cell) {
    const { q, r } = cell
    const neighbors = []
    const rowOffset = this.getRowOffset(r)

    // East neighbor (same row, q+1)
    const east = this.getCell(q + 1, r)
    if (east) neighbors.push(east)

    // West neighbor (same row, q-1)
    const west = this.getCell(q - 1, r)
    if (west) neighbors.push(west)

    // Northeast neighbor (row above)
    const ne = this.getCell(q + 1 - rowOffset, r - 1)
    if (ne) neighbors.push(ne)

    // Northwest neighbor (row above)
    const nw = this.getCell(q - rowOffset, r - 1)
    if (nw) neighbors.push(nw)

    // Southeast neighbor (row below)
    const se = this.getCell(q + 1 - rowOffset, r + 1)
    if (se) neighbors.push(se)

    // Southwest neighbor (row below)
    const sw = this.getCell(q - rowOffset, r + 1)
    if (sw) neighbors.push(sw)

    return neighbors
  }

  cellKey(cell) {
    return `${cell.q},${cell.r}`
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
    return cell1.q === cell2.q && cell1.r === cell2.r
  }

  // Get the 6 corner vertices of a hexagon (pointy-top)
  // Returns corners in order for wall drawing
  getHexCorners(q, r) {
    const rowXOffset = Math.abs(r % 2) * this.xOffset
    const ys = this.yScale
    const p1x = rowXOffset + q * 2 * this.xOffset
    const p1y = (this.yOffset1 + r * this.yOffset2) * ys
    const p2x = p1x
    const p2y = (r + 1) * this.yOffset2 * ys
    const p3x = rowXOffset + (2 * q + 1) * this.xOffset
    const p3y = (r * this.yOffset2 + 2) * ys
    const p4x = p2x + 2 * this.xOffset
    const p4y = p2y
    const p5x = p4x
    const p5y = p1y
    const p6x = p3x
    const p6y = r * this.yOffset2 * ys

    return [
      [p1x, p1y], // top-left
      [p2x, p2y], // bottom-left
      [p3x, p3y], // bottom
      [p4x, p4y], // bottom-right
      [p5x, p5y], // top-right
      [p6x, p6y], // top
    ]
  }

  extractWalls() {
    const walls = []
    const vertexCache = new Map()

    const makeVertex = (x, y) => {
      const rx = Math.round(x * 1000000) / 1000000
      const ry = Math.round(y * 1000000) / 1000000
      const key = `${rx},${ry}`

      if (!vertexCache.has(key)) {
        vertexCache.set(key, new Victor(rx, ry))
      }

      return vertexCache.get(key)
    }

    for (const cell of this.cells) {
      const { q, r } = cell
      const corners = this.getHexCorners(q, r)
      const rowOffset = this.getRowOffset(r)

      // Edge between p1-p2 (west edge)
      const west = this.getCell(q - 1, r)

      if (!west || !this.isLinked(cell, west)) {
        walls.push([
          makeVertex(corners[0][0], corners[0][1]),
          makeVertex(corners[1][0], corners[1][1]),
        ])
      }

      // Edge between p2-p3 (southwest edge)
      const sw = this.getCell(q - rowOffset, r + 1)

      if (!sw || !this.isLinked(cell, sw)) {
        walls.push([
          makeVertex(corners[1][0], corners[1][1]),
          makeVertex(corners[2][0], corners[2][1]),
        ])
      }

      // Edge between p3-p4 (southeast edge)
      const se = this.getCell(q + 1 - rowOffset, r + 1)

      if (!se || !this.isLinked(cell, se)) {
        walls.push([
          makeVertex(corners[2][0], corners[2][1]),
          makeVertex(corners[3][0], corners[3][1]),
        ])
      }

      // Edge between p4-p5 (east edge)
      const east = this.getCell(q + 1, r)

      if (!east || !this.isLinked(cell, east)) {
        walls.push([
          makeVertex(corners[3][0], corners[3][1]),
          makeVertex(corners[4][0], corners[4][1]),
        ])
      }

      // Edge between p5-p6 (northeast edge)
      const ne = this.getCell(q + 1 - rowOffset, r - 1)

      if (!ne || !this.isLinked(cell, ne)) {
        walls.push([
          makeVertex(corners[4][0], corners[4][1]),
          makeVertex(corners[5][0], corners[5][1]),
        ])
      }

      // Edge between p6-p1 (northwest edge)
      const nw = this.getCell(q - rowOffset, r - 1)

      if (!nw || !this.isLinked(cell, nw)) {
        walls.push([
          makeVertex(corners[5][0], corners[5][1]),
          makeVertex(corners[0][0], corners[0][1]),
        ])
      }
    }

    return walls
  }
}
