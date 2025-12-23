/* global console, document */
import Victor from "victor"
import { pointsOnPath } from "points-on-path"
import svgpath from "svgpath"
import Shape, { adjustSizeForAspectRatio } from "../Shape"
import Graph from "@/common/Graph"
import { eulerianTrail } from "@/common/eulerian_trail/eulerianTrail"
import { eulerizeEdges } from "@/common/chinesePostman"
import { getColorBrightness } from "@/common/colors"
import {
  circle,
  ellipse,
  ellipticalArc,
  centerOnOrigin,
  applyMatrixToVertices,
  cloneVertex,
  snapToGrid,
  subsample,
} from "@/common/geometry"

// Set to true to show raw SVG content textarea
const DEBUG = false

const options = {
  svgContent: {
    title: "SVG content",
    type: "textarea",
    isVisible: () => DEBUG,
  },
  minStrokeWidth: {
    title: "Min stroke width",
    min: 0,
    max: 10,
    step: 1,
    onChange: adjustSizeForAspectRatio,
  },
  fillBrightness: {
    title: "Fill brightness",
    type: "slider",
    range: true,
    min: 0,
    max: 255,
    onChange: adjustSizeForAspectRatio,
  },
}

// Default test SVG for development
const DEFAULT_SVG = `<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" stroke="black" fill="none"/>
</svg>`

const SUBSAMPLE_LENGTH = 40
const SMALL_SVG_THRESHOLD = 500
const TARGET_SVG_SIZE = 2000
const CURVE_RESOLUTION = 128
const DUPLICATE_THRESHOLD = 0.01

export default class SVGImport extends Shape {
  constructor() {
    super("svgImport")
    this.label = "SVG"
    this.usesMachine = true
    this.stretch = true
    this.selectGroup = "import"
  }

  getInitialState(props) {
    return {
      ...super.getInitialState(),
      svgContent: props?.svgContent || DEFAULT_SVG,
      minStrokeWidth: 0,
      fillBrightness: [0, 255],
      maintainAspectRatio: true,
    }
  }

  initialDimensions(props) {
    return this.scaledToMachine(props, 0.6)
  }

  getVertices(state) {
    const { svgContent, minStrokeWidth, fillBrightness } = state.shape

    if (!svgContent || svgContent.trim() === "") {
      return [new Victor(0, 0)]
    }

    try {
      const paths = this.parseSVG(svgContent, minStrokeWidth, fillBrightness)

      if (paths.length === 0) {
        return [new Victor(0, 0)]
      }

      const vertices = this.connectPaths(paths)

      vertices.forEach((v) => (v.y = -v.y))
      centerOnOrigin(vertices)

      return vertices
    } catch (e) {
      console.error("SVG parse error:", e)
      return [new Victor(0, 0)]
    }
  }

  // Calculate scale factor for small SVGs (for path precision)
  getScaleFactorForSmallSvg(svg) {
    const { width, height } = this.getSvgSize(svg)
    const minDim = Math.min(width, height)

    return minDim < SMALL_SVG_THRESHOLD ? TARGET_SVG_SIZE / minDim : 1
  }

  // Get SVG dimensions from viewBox or width/height attributes
  getSvgSize(svg) {
    const viewBox = svg.getAttribute("viewBox")

    if (viewBox) {
      const parts = viewBox.split(/[\s,]+/).map(parseFloat)

      if (parts.length >= 4) {
        return { width: parts[2], height: parts[3] }
      }
    }

    const width = parseFloat(svg.getAttribute("width")) || 100
    const height = parseFloat(svg.getAttribute("height")) || 100

    return { width, height }
  }

  // Parse SVG content and return array of paths (each path is array of vertices)
  parseSVG(svgContent, minStrokeWidth = 0, fillBrightness = [0, 255]) {
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
      this.expandUseElements(svg)
      const scaleFactor = this.getScaleFactorForSmallSvg(svg)

      // Scale tolerance to SVG size for consistent curve smoothness
      const { width, height } = this.getSvgSize(svg)
      const tolerance = Math.min(width, height) / 1000

      const paths = []
      const selectors = "path, line, polyline, polygon, rect, circle, ellipse"
      const elements = svg.querySelectorAll(selectors)

      elements.forEach((element) => {
        if (element.closest("defs")) {
          return
        }

        if (!this.isElementVisible(element, minStrokeWidth, fillBrightness)) {
          return
        }

        const result = this.elementToVertices(element, tolerance, scaleFactor)

        if (!result) {
          return
        }

        const ctm = element.getCTM()
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

      const clone = referenced.cloneNode(true)

      clone.removeAttribute("id")

      const x = parseFloat(use.getAttribute("x")) || 0
      const y = parseFloat(use.getAttribute("y")) || 0

      if (x !== 0 || y !== 0) {
        const existingTransform = clone.getAttribute("transform") || ""

        clone.setAttribute(
          "transform",
          `translate(${x}, ${y}) ${existingTransform}`,
        )
      }

      use.parentNode.replaceChild(clone, use)
    })
  }

  isElementVisible(element, minStrokeWidth = 0, fillBrightness = [0, 255]) {
    const styles = getComputedStyle(element)
    const stroke = styles.stroke
    const fill = styles.fill

    // Check stroked elements against minimum width threshold
    if (stroke && stroke !== "none") {
      const strokeWidth = parseFloat(styles.strokeWidth) || 1

      return strokeWidth >= minStrokeWidth
    }

    // Check fill brightness against range
    // SVG default fill is black when not specified
    if (fill === "none") {
      return false
    }

    const brightness = fill ? getColorBrightness(fill) : 0
    const [minBrightness, maxBrightness] = fillBrightness

    return brightness >= minBrightness && brightness <= maxBrightness
  }

  elementToVertices(element, tolerance = 0.5, scaleFactor = 1) {
    const tagName = element.tagName.toLowerCase()

    switch (tagName) {
      case "path":
        return this.pathToVertices(element, tolerance, scaleFactor)
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
  // For small SVGs, scales path data up before processing for better precision
  pathToVertices(element, tolerance = 0.5, scaleFactor = 1) {
    const d = element.getAttribute("d")

    if (!d) {
      return null
    }

    try {
      // Scale up path data for small SVGs to get better precision from points-on-path
      const scaledD = scaleFactor > 1 ? svgpath(d).scale(scaleFactor).toString() : d

      const distance = 0.5
      const pointArrays = pointsOnPath(scaledD, tolerance, distance)

      return pointArrays
        .filter((points) => points.length > 0)
        .map((points) => points.map((pt) => new Victor(pt[0], pt[1])))
    } catch {
      // Skip malformed paths (e.g., containing NaN)
      return null
    }
  }

  // <line x1="" y1="" x2="" y2="">
  // Subsample long edges to avoid outlier detection filtering
  lineToVertices(element) {
    const x1 = parseFloat(element.getAttribute("x1")) || 0
    const y1 = parseFloat(element.getAttribute("y1")) || 0
    const x2 = parseFloat(element.getAttribute("x2")) || 0
    const y2 = parseFloat(element.getAttribute("y2")) || 0

    return subsample([new Victor(x1, y1), new Victor(x2, y2)], SUBSAMPLE_LENGTH)
  }

  // <polyline points=""> or <polygon points="">
  // Subsample long edges to avoid outlier detection filtering
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

    if (close && vertices.length > 0) {
      vertices.push(vertices[0].clone())
    }

    return subsample(vertices, SUBSAMPLE_LENGTH)
  }

  // <rect x="" y="" width="" height="" rx="" ry="">
  // Subsample long edges to avoid outlier detection filtering
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
      return subsample(
        [
          new Victor(x, y),
          new Victor(x + width, y),
          new Victor(x + width, y + height),
          new Victor(x, y + height),
          new Victor(x, y),
        ],
        SUBSAMPLE_LENGTH,
      )
    }

    // Rounded rectangle - build path with corner arcs
    const vertices = []
    const resolution = 16 // points per corner

    // Top edge (left to right)
    vertices.push(new Victor(x + rx, y))
    vertices.push(new Victor(x + width - rx, y))

    // Top-right corner
    vertices.push(
      ...ellipticalArc(
        rx,
        ry,
        -Math.PI / 2,
        0,
        x + width - rx,
        y + ry,
        resolution,
      ),
    )

    // Right edge
    vertices.push(new Victor(x + width, y + ry))
    vertices.push(new Victor(x + width, y + height - ry))

    // Bottom-right corner
    vertices.push(
      ...ellipticalArc(
        rx,
        ry,
        0,
        Math.PI / 2,
        x + width - rx,
        y + height - ry,
        resolution,
      ),
    )

    // Bottom edge
    vertices.push(new Victor(x + width - rx, y + height))
    vertices.push(new Victor(x + rx, y + height))

    // Bottom-left corner
    vertices.push(
      ...ellipticalArc(
        rx,
        ry,
        Math.PI / 2,
        Math.PI,
        x + rx,
        y + height - ry,
        resolution,
      ),
    )

    // Left edge
    vertices.push(new Victor(x, y + height - ry))
    vertices.push(new Victor(x, y + ry))

    // Top-left corner
    vertices.push(
      ...ellipticalArc(
        rx,
        ry,
        Math.PI,
        (3 * Math.PI) / 2,
        x + rx,
        y + ry,
        resolution,
      ),
    )

    // Close the path
    vertices.push(vertices[0].clone())

    return subsample(vertices, SUBSAMPLE_LENGTH)
  }

  // <circle cx="" cy="" r="">
  circleToVertices(element) {
    const cx = parseFloat(element.getAttribute("cx")) || 0
    const cy = parseFloat(element.getAttribute("cy")) || 0
    const r = parseFloat(element.getAttribute("r")) || 0

    if (r <= 0) {
      return null
    }

    return circle(r, 0, cx, cy, CURVE_RESOLUTION)
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

    return ellipse(rx, ry, cx, cy, CURVE_RESOLUTION)
  }

  // Nodes within tolerance share the same key - could extract to geometry.js if reused
  proximityNode(x, y, tolerance = 1) {
    const sx = snapToGrid(x, tolerance)
    const sy = snapToGrid(y, tolerance)
    const key = `${sx.toFixed(2)},${sy.toFixed(2)}`

    return { x, y, toString: () => key }
  }

  // Build graph from paths with ALL vertices as nodes and ALL segments as edges
  // Uses proximity-based node merging (nodes within tolerance share a key)
  // Closed paths are included as cycles in the graph
  buildPathGraph(paths, tolerance = 1) {
    const graph = new Graph()
    const CLOSED_TOLERANCE = 0.5
    const OUTLIER_THRESHOLD = 10 // Skip segments that are 10x longer than median

    for (const path of paths) {
      if (path.length < 2) continue // Skip degenerate paths (need at least 2 points for an edge)

      // Pre-compute segment lengths to detect outlier segments
      const segmentLengths = []

      for (let i = 0; i < path.length - 1; i++) {
        segmentLengths.push(
          Math.hypot(path[i + 1].x - path[i].x, path[i + 1].y - path[i].y),
        )
      }

      // Find median segment length and mark outliers (any segment >> median)
      const medianLength = this.median(segmentLengths)
      const outlierIndices = new Set()

      for (let i = 0; i < segmentLengths.length; i++) {
        if (segmentLengths[i] > medianLength * OUTLIER_THRESHOLD) {
          outlierIndices.add(i)
        }
      }

      for (const pt of path) {
        graph.addNode(this.proximityNode(pt.x, pt.y, tolerance))
      }

      // Add edges for consecutive segments
      // Note: pointsOnPath already separates subpaths (M commands), so no discontinuities within a path
      // Skip outlier segments (e.g., long L commands that jump across filled shapes)
      for (let i = 0; i < path.length - 1; i++) {
        if (outlierIndices.has(i)) continue

        const pt1 = path[i]
        const pt2 = path[i + 1]
        const node1 = this.proximityNode(pt1.x, pt1.y, tolerance)
        const node2 = this.proximityNode(pt2.x, pt2.y, tolerance)

        if (node1.toString() !== node2.toString()) {
          graph.addEdge(node1, node2)
        }
      }

      // For closed paths, add the closing edge
      const startPt = path[0]
      const endPt = path[path.length - 1]

      if (startPt.distance(endPt) < CLOSED_TOLERANCE) {
        const node1 = this.proximityNode(endPt.x, endPt.y, tolerance)
        const node2 = this.proximityNode(startPt.x, startPt.y, tolerance)

        if (node1.toString() !== node2.toString()) {
          graph.addEdge(node1, node2)
        }
      }
    }

    return graph
  }

  // Calculate median of an array of numbers
  median(arr) {
    if (arr.length === 0) return 0

    const sorted = [...arr].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)

    return sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2
  }

  // Flatten paths into single vertex array using Chinese Postman algorithm
  // Graph contains ALL vertices and segments from ALL paths (open and closed)
  // CPP finds optimal traversal that covers every segment
  connectPaths(paths) {
    if (paths.length === 0) return []
    if (paths.length === 1) return paths[0].map((v) => cloneVertex(v))

    const tolerance = 3 // Node merge tolerance in SVG units
    const graph = this.buildPathGraph(paths, tolerance)

    graph.connectComponents()

    const edges = Object.values(graph.edgeMap)
    const dijkstraFn = (startKey, endKey) =>
      graph.dijkstraShortestPath(startKey, endKey)
    const { edges: eulerizedEdges } = eulerizeEdges(
      edges,
      dijkstraFn,
      graph.nodeMap,
    )
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

      if (dist < DUPLICATE_THRESHOLD) return
    }

    vertices.push(cloneVertex(point))
  }

  getOptions() {
    return options
  }
}
