import Victor from "victor"
import { pointsOnPath } from "points-on-path"
import Shape from "./Shape"
import Graph from "@/common/Graph"
import UnionFind from "@/common/UnionFind"
import { eulerianTrail } from "@/common/eulerian_trail/eulerianTrail"
import { eulerizeEdges } from "@/common/chinesePostman"
import {
  circle,
  ellipse,
  centerOnOrigin,
  applyMatrixToVertices,
  cloneVertex,
} from "@/common/geometry"

const options = {
  svgContent: {
    title: "SVG content",
    type: "textarea",
  },
}

// Default test SVG for development
const DEFAULT_SVG = `<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" stroke="black" fill="none"/>
</svg>`

export default class SVGImport extends Shape {
  constructor() {
    super("svgImport")
    this.label = "SVG"
    this.usesMachine = true
    this.selectGroup = "import"
  }

  getInitialState(props) {
    return {
      ...super.getInitialState(),
      svgContent: props?.svgContent || DEFAULT_SVG,
    }
  }

  getVertices(state) {
    const { svgContent } = state.shape

    if (!svgContent || svgContent.trim() === "") {
      return [new Victor(0, 0)]
    }

    try {
      const paths = this.parseSVG(svgContent)

      if (paths.length === 0) {
        return [new Victor(0, 0)]
      }

      // Flatten paths using CPP-based routing
      const vertices = this.flattenPaths(paths)

      // Flip Y axis: SVG Y goes down, sand table Y goes up
      vertices.forEach((v) => (v.y = -v.y))

      centerOnOrigin(vertices)

      return vertices
    } catch (e) {
      console.error("SVG parse error:", e)
      return [new Victor(0, 0)]
    }
  }

  // Parse SVG content and return array of paths (each path is array of vertices)
  parseSVG(svgContent) {
    // Use innerHTML to parse SVG directly into HTML DOM context
    // This ensures elements are proper SVGGraphicsElement instances with getCTM()
    const container = document.createElement("div")
    container.style.position = "absolute"
    container.style.visibility = "hidden"
    container.style.left = "-9999px"
    container.innerHTML = svgContent

    const svg = container.querySelector("svg")

    if (!svg) {
      return []
    }

    document.body.appendChild(container)

    try {
      // Expand <use> elements first
      this.expandUseElements(svg)

      // Collect all drawable elements
      const paths = []
      const selectors = "path, line, polyline, polygon, rect, circle, ellipse"
      const elements = svg.querySelectorAll(selectors)

      elements.forEach((element) => {
        // Skip elements inside <defs>
        if (element.closest("defs")) {
          return
        }

        // Check visibility (stroke or fill)
        if (!this.isElementVisible(element)) {
          return
        }

        const result = this.elementToVertices(element)

        if (!result) {
          return
        }

        // Get cumulative transform
        const ctm = element.getCTM()

        // pathToVertices returns array of paths (subpaths), others return single path
        const elementPaths = Array.isArray(result[0]) ? result : [result]

        elementPaths.forEach((vertices) => {
          if (vertices && vertices.length > 0) {
            if (ctm) {
              applyMatrixToVertices(vertices, ctm)
            }
            paths.push(vertices)
          }
        })
      })

      return paths
    } finally {
      document.body.removeChild(container)
    }
  }

  // Expand <use> elements by cloning referenced content
  expandUseElements(svg) {
    const useElements = svg.querySelectorAll("use")

    useElements.forEach((use) => {
      const href = use.getAttribute("href") || use.getAttribute("xlink:href")

      if (!href || !href.startsWith("#")) {
        return
      }

      const id = href.slice(1)
      const referenced = svg.getElementById(id)

      if (!referenced) {
        return
      }

      // Clone the referenced element
      const clone = referenced.cloneNode(true)
      clone.removeAttribute("id")

      // Apply use element's position
      const x = parseFloat(use.getAttribute("x")) || 0
      const y = parseFloat(use.getAttribute("y")) || 0

      if (x !== 0 || y !== 0) {
        const existingTransform = clone.getAttribute("transform") || ""
        clone.setAttribute(
          "transform",
          `translate(${x}, ${y}) ${existingTransform}`,
        )
      }

      // Replace <use> with cloned content
      use.parentNode.replaceChild(clone, use)
    })
  }

  // Parse a color string and return brightness (0-255), or null if unparseable
  getColorBrightness(color) {
    if (!color || color === "none") {
      return null
    }

    const c = color.toLowerCase().trim()

    // Handle hex colors
    if (c.startsWith("#")) {
      let hex = c.slice(1)

      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
      }

      if (hex.length === 6) {
        const r = parseInt(hex.slice(0, 2), 16)
        const g = parseInt(hex.slice(2, 4), 16)
        const b = parseInt(hex.slice(4, 6), 16)

        // Perceived brightness formula
        return 0.299 * r + 0.587 * g + 0.114 * b
      }
    }

    // Handle rgb() / rgba()
    const rgbMatch = c.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)

    if (rgbMatch) {
      const r = parseInt(rgbMatch[1], 10)
      const g = parseInt(rgbMatch[2], 10)
      const b = parseInt(rgbMatch[3], 10)

      return 0.299 * r + 0.587 * g + 0.114 * b
    }

    // Handle common named colors
    const namedColors = {
      black: 0,
      white: 255,
      red: 76,
      green: 150,
      blue: 29,
      yellow: 226,
      orange: 156,
      brown: 101,
      gray: 128,
      grey: 128,
    }

    if (namedColors[c] !== undefined) {
      return namedColors[c]
    }

    return null
  }

  // Check if element should be rendered (stroke-only mode for sand tables)
  isElementVisible(element) {
    const stroke = this.getStyleProperty(element, "stroke")
    const fill = this.getStyleProperty(element, "fill")

    // Draw if has stroke
    if (stroke && stroke !== "none") {
      return true
    }

    // Include all fills (traced as outlines)
    // TODO: make this configurable via UI
    // SVG default fill is black when not specified, so null or missing = black = include
    if (fill !== "none") {
      return true
    }

    return false
  }

  // Get a style property from element (checking attribute, style, and inherited from parents)
  getStyleProperty(element, property) {
    let current = element

    while (current && current.tagName) {
      // Check inline style first
      const style = current.getAttribute("style")

      if (style) {
        const match = style.match(new RegExp(`${property}\\s*:\\s*([^;]+)`))
        if (match) {
          return match[1].trim()
        }
      }

      // Check attribute
      const attr = current.getAttribute(property)

      if (attr) {
        return attr
      }

      // Walk up to parent
      current = current.parentElement
    }

    return null
  }

  // Convert an SVG element to an array of vertices
  elementToVertices(element) {
    const tagName = element.tagName.toLowerCase()

    switch (tagName) {
      case "path":
        return this.pathToVertices(element)
      case "line":
        return this.lineToVertices(element)
      case "polyline":
        return this.polylineToVertices(element, false)
      case "polygon":
        return this.polylineToVertices(element, true)
      case "rect":
        return this.rectToVertices(element)
      case "circle":
        return this.circleToVertices(element)
      case "ellipse":
        return this.ellipseToVertices(element)
      default:
        return null
    }
  }

  // <path d="..."> - use points-on-path for Bezier linearization
  // Returns array of paths (one per subpath in d attribute)
  pathToVertices(element) {
    const d = element.getAttribute("d")

    if (!d) {
      return null
    }

    try {
      const tolerance = 0.5
      const distance = 0.5
      const pointArrays = pointsOnPath(d, tolerance, distance)

      return pointArrays
        .filter((points) => points.length > 0)
        .map((points) => points.map((pt) => new Victor(pt[0], pt[1])))
    } catch {
      // Skip malformed paths (e.g., containing NaN)
      return null
    }
  }

  // <line x1="" y1="" x2="" y2="">
  lineToVertices(element) {
    const x1 = parseFloat(element.getAttribute("x1")) || 0
    const y1 = parseFloat(element.getAttribute("y1")) || 0
    const x2 = parseFloat(element.getAttribute("x2")) || 0
    const y2 = parseFloat(element.getAttribute("y2")) || 0

    return [new Victor(x1, y1), new Victor(x2, y2)]
  }

  // <polyline points=""> or <polygon points="">
  polylineToVertices(element, close) {
    const pointsAttr = element.getAttribute("points")

    if (!pointsAttr) {
      return null
    }

    // Parse points: "x1,y1 x2,y2 ..." or "x1 y1 x2 y2 ..."
    const coords = pointsAttr
      .trim()
      .split(/[\s,]+/)
      .map(parseFloat)
    const vertices = []

    for (let i = 0; i < coords.length - 1; i += 2) {
      vertices.push(new Victor(coords[i], coords[i + 1]))
    }

    // Close polygon by repeating first point
    if (close && vertices.length > 0) {
      vertices.push(vertices[0].clone())
    }

    return vertices
  }

  // <rect x="" y="" width="" height="" rx="" ry="">
  rectToVertices(element) {
    const x = parseFloat(element.getAttribute("x")) || 0
    const y = parseFloat(element.getAttribute("y")) || 0
    const width = parseFloat(element.getAttribute("width")) || 0
    const height = parseFloat(element.getAttribute("height")) || 0
    let rx = parseFloat(element.getAttribute("rx")) || 0
    let ry = parseFloat(element.getAttribute("ry")) || 0

    // If only one radius specified, use it for both
    if (rx && !ry) ry = rx
    if (ry && !rx) rx = ry

    // Clamp radii
    rx = Math.min(rx, width / 2)
    ry = Math.min(ry, height / 2)

    if (rx === 0 && ry === 0) {
      // Simple rectangle
      return [
        new Victor(x, y),
        new Victor(x + width, y),
        new Victor(x + width, y + height),
        new Victor(x, y + height),
        new Victor(x, y),
      ]
    }

    // Rounded rectangle - build path with corner arcs
    const vertices = []
    const resolution = 16 // points per corner

    // Top edge (left to right)
    vertices.push(new Victor(x + rx, y))
    vertices.push(new Victor(x + width - rx, y))

    // Top-right corner
    this.addCornerArc(
      vertices,
      x + width - rx,
      y + ry,
      rx,
      ry,
      -Math.PI / 2,
      0,
      resolution,
    )

    // Right edge
    vertices.push(new Victor(x + width, y + ry))
    vertices.push(new Victor(x + width, y + height - ry))

    // Bottom-right corner
    this.addCornerArc(
      vertices,
      x + width - rx,
      y + height - ry,
      rx,
      ry,
      0,
      Math.PI / 2,
      resolution,
    )

    // Bottom edge
    vertices.push(new Victor(x + width - rx, y + height))
    vertices.push(new Victor(x + rx, y + height))

    // Bottom-left corner
    this.addCornerArc(
      vertices,
      x + rx,
      y + height - ry,
      rx,
      ry,
      Math.PI / 2,
      Math.PI,
      resolution,
    )

    // Left edge
    vertices.push(new Victor(x, y + height - ry))
    vertices.push(new Victor(x, y + ry))

    // Top-left corner
    this.addCornerArc(
      vertices,
      x + rx,
      y + ry,
      rx,
      ry,
      Math.PI,
      (3 * Math.PI) / 2,
      resolution,
    )

    // Close the path
    vertices.push(vertices[0].clone())

    return vertices
  }

  // Add an elliptical arc for rounded rect corners
  addCornerArc(vertices, cx, cy, rx, ry, startAngle, endAngle, resolution) {
    const steps = Math.max(
      4,
      Math.ceil((resolution * Math.abs(endAngle - startAngle)) / (Math.PI / 2)),
    )

    for (let i = 0; i <= steps; i++) {
      const angle = startAngle + (endAngle - startAngle) * (i / steps)
      vertices.push(
        new Victor(cx + Math.cos(angle) * rx, cy + Math.sin(angle) * ry),
      )
    }
  }

  // <circle cx="" cy="" r="">
  circleToVertices(element) {
    const cx = parseFloat(element.getAttribute("cx")) || 0
    const cy = parseFloat(element.getAttribute("cy")) || 0
    const r = parseFloat(element.getAttribute("r")) || 0

    if (r <= 0) {
      return null
    }

    return circle(r, 0, cx, cy, 128)
  }

  // <ellipse cx="" cy="" rx="" ry="">
  ellipseToVertices(element) {
    const cx = parseFloat(element.getAttribute("cx")) || 0
    const cy = parseFloat(element.getAttribute("cy")) || 0
    const rx = parseFloat(element.getAttribute("rx")) || 0
    const ry = parseFloat(element.getAttribute("ry")) || 0

    if (rx <= 0 || ry <= 0) {
      return null
    }

    return ellipse(rx, ry, cx, cy, 128)
  }

  snapToGrid(value, tolerance) {
    return Math.round(value / tolerance) * tolerance
  }

  nodeKey(x, y, tolerance = 1) {
    const sx = this.snapToGrid(x, tolerance)
    const sy = this.snapToGrid(y, tolerance)

    return `${sx.toFixed(2)},${sy.toFixed(2)}`
  }

  createNode(x, y, tolerance = 1) {
    const key = this.nodeKey(x, y, tolerance)

    return { x, y, toString: () => key }
  }

  // Build graph from paths with ALL vertices as nodes and ALL segments as edges
  // Uses proximity-based node merging (nodes within tolerance share a key)
  // Closed paths are included as cycles in the graph
  buildPathGraph(paths, tolerance = 1) {
    const graph = new Graph()
    const CLOSED_TOLERANCE = 0.5

    for (const path of paths) {
      if (path.length < 3) continue // Skip degenerate paths (need at least 3 for a shape)

      for (const pt of path) {
        graph.addNode(this.createNode(pt.x, pt.y, tolerance))
      }

      // Add edges for consecutive segments
      // Note: pointsOnPath already separates subpaths (M commands), so no discontinuities within a path
      for (let i = 0; i < path.length - 1; i++) {
        const pt1 = path[i]
        const pt2 = path[i + 1]
        const node1 = this.createNode(pt1.x, pt1.y, tolerance)
        const node2 = this.createNode(pt2.x, pt2.y, tolerance)

        if (node1.toString() !== node2.toString()) {
          graph.addEdge(node1, node2)
        }
      }

      // For closed paths, add the closing edge
      const startPt = path[0]
      const endPt = path[path.length - 1]

      if (startPt.distance(endPt) < CLOSED_TOLERANCE) {
        const node1 = this.createNode(endPt.x, endPt.y, tolerance)
        const node2 = this.createNode(startPt.x, startPt.y, tolerance)

        if (node1.toString() !== node2.toString()) {
          graph.addEdge(node1, node2)
        }
      }
    }

    return graph
  }

  // Find connected components in the graph
  findComponents(graph) {
    const visited = new Set()
    const components = []

    for (const nodeKey of graph.nodeKeys) {
      if (visited.has(nodeKey)) continue

      const component = []
      const stack = [nodeKey]

      while (stack.length > 0) {
        const key = stack.pop()

        if (visited.has(key)) continue

        visited.add(key)
        component.push(key)

        const neighbors = graph.adjacencyList[key] || []

        for (const { node } of neighbors) {
          const neighborKey = node.toString()

          if (!visited.has(neighborKey)) {
            stack.push(neighborKey)
          }
        }
      }

      components.push(component)
    }

    return components
  }

  // Add bridge edges to connect disconnected components using MST (Kruskal's algorithm)
  connectComponents(graph) {
    const components = this.findComponents(graph)

    if (components.length <= 1) return

    // Build list of all possible bridges between all component pairs
    // Then use Kruskal-style MST to connect them optimally
    const allBridges = []

    for (let i = 0; i < components.length; i++) {
      for (let j = i + 1; j < components.length; j++) {
        let bestDist = Infinity
        let bestPair = null

        // Find shortest bridge between component i and j
        for (const key1 of components[i]) {
          const node1 = graph.nodeMap[key1]

          for (const key2 of components[j]) {
            const node2 = graph.nodeMap[key2]
            const dist = Math.hypot(node1.x - node2.x, node1.y - node2.y)

            if (dist < bestDist) {
              bestDist = dist
              bestPair = [node1, node2]
            }
          }
        }

        if (bestPair) {
          allBridges.push({
            dist: bestDist,
            pair: bestPair,
            comp1: i,
            comp2: j,
          })
        }
      }
    }

    // Sort bridges by distance (shortest first)
    allBridges.sort((a, b) => a.dist - b.dist)

    const uf = new UnionFind()

    for (let i = 0; i < components.length; i++) {
      uf.makeSet(i)
    }

    // Kruskal's algorithm: add shortest bridges that connect new components
    for (const bridge of allBridges) {
      if (uf.union(bridge.comp1, bridge.comp2)) {
        graph.addEdge(bridge.pair[0], bridge.pair[1])
      }
    }
  }

  // Flatten paths into single vertex array using Chinese Postman algorithm
  // Graph contains ALL vertices and segments from ALL paths (open and closed)
  // CPP finds optimal traversal that covers every segment
  flattenPaths(paths) {
    if (paths.length === 0) return []
    if (paths.length === 1) return paths[0].map((v) => cloneVertex(v))

    const tolerance = 3 // Node merge tolerance in SVG units
    const graph = this.buildPathGraph(paths, tolerance)

    this.connectComponents(graph)

    const edges = Object.values(graph.edgeMap)
    const dijkstraFn = (startKey, endKey) => graph.dijkstraShortestPath(startKey, endKey)
    const { edges: eulerizedEdges } = eulerizeEdges(edges, dijkstraFn, graph.nodeMap)
    const trail = eulerianTrail({ edges: eulerizedEdges })
    const vertices = []

    for (const nodeKey of trail) {
      const node = graph.nodeMap[nodeKey]

      if (node) {
        this.addVertex(vertices, node)
      }
    }

    return vertices
  }

  // Helper to add vertex, skipping duplicates
  addVertex(vertices, point) {
    if (vertices.length > 0) {
      const last = vertices[vertices.length - 1]
      const dist = Math.hypot(point.x - last.x, point.y - last.y)

      if (dist < 0.01) return // Skip near-duplicate
    }

    vertices.push(cloneVertex(point))
  }

  getOptions() {
    return options
  }
}
