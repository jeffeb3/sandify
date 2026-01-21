/* global console, document, getComputedStyle */
import Victor from "victor"
import { pointsOnPath } from "points-on-path"
import svgpath from "svgpath"
import Shape, { adjustSizeForAspectRatio } from "../Shape"
import Graph, { getEulerianTrail } from "@/common/Graph"
import { getColorBrightness } from "@/common/colors"
import { median } from "@/common/util"
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

const options = {
  svgContent: {
    title: "SVG content",
    type: "textarea",
    isVisible: () => DEBUG,
  },
  svgMinStrokeWidth: {
    title: "Min stroke width",
    min: 0,
    max: 10,
    step: 1,
    onChange: adjustSizeForAspectRatio,
  },
  svgFillBrightness: {
    title: "Fill brightness",
    type: "slider",
    range: true,
    min: 0,
    max: 255,
    onChange: adjustSizeForAspectRatio,
  },
}

// Set to true to show raw SVG content textarea
const DEBUG = false

// Default test SVG for development
const DEFAULT_SVG = `<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" stroke="black" fill="none"/>
</svg>`

const SUBSAMPLE_LENGTH = 40 // Max segment length for line/polyline/polygon edges
const SMALL_SVG_THRESHOLD = 500 // SVGs smaller than this get scaled up for precision
const TARGET_SVG_SIZE = 2000 // Target size when scaling up small SVGs
const CURVE_RESOLUTION = 128 // Points per circle/ellipse
const CORNER_RESOLUTION = 16 // Points per rounded rectangle corner
const DUPLICATE_THRESHOLD = 0.01 // Distance below which consecutive points are merged
const NODE_MERGE_TOLERANCE = 3 // SVG units - nodes within this distance share a key
const CLOSED_PATH_TOLERANCE = 0.5 // Distance threshold to consider a path closed
const OUTLIER_THRESHOLD = 10 // Skip segments that are 10x longer than median

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
      svgMinStrokeWidth: 0,
      svgFillBrightness: [0, 255],
      maintainAspectRatio: true,
    }
  }

  initialDimensions(props) {
    return this.scaledToMachine(props, 0.6)
  }

  getVertices(state) {
    const { svgContent, svgMinStrokeWidth, svgFillBrightness } = state.shape

    if (!svgContent || svgContent.trim() === "") {
      return [new Victor(0, 0)]
    }

    try {
      const paths = this.parseSVG(svgContent, svgMinStrokeWidth, svgFillBrightness)

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

        if (
          !this.shouldIncludeElement(element, minStrokeWidth, fillBrightness)
        ) {
          return
        }

        const result = this.drawElement(element, tolerance, scaleFactor)

        if (!result) {
          return
        }

        const ctm = element.getCTM()
        const elementPaths = Array.isArray(result[0]) ? result : [result]

        elementPaths.forEach((vertices) => {
          if (vertices && vertices.length > 0) {
            if (ctm) {
              // Scale CTM translation to work with scaled path coordinates
              // Original: x' = a*x + c*y + e → With scaled input: x' = a*(x*s) + c*(y*s) + e*s
              const adjustedCtm =
                scaleFactor > 1
                  ? {
                      a: ctm.a,
                      b: ctm.b,
                      c: ctm.c,
                      d: ctm.d,
                      e: ctm.e * scaleFactor,
                      f: ctm.f * scaleFactor,
                    }
                  : ctm
              applyMatrixToVertices(vertices, adjustedCtm)
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

  // Determine if an SVG element should be included based on stroke width and fill brightness.
  // Returns true if element passes the filter criteria.
  shouldIncludeElement(element, minStrokeWidth = 0, fillBrightness = [0, 255]) {
    const styles = getComputedStyle(element)

    // Skip elements with filters (blur, drop shadow, etc.)
    if (styles.filter && styles.filter !== "none") {
      return false
    }

    const stroke = styles.stroke
    const fill = styles.fill
    const hasStroke = stroke && stroke !== "none"
    const hasFill = fill && fill !== "none"

    // Elements with neither stroke nor fill are invisible
    if (!hasStroke && !hasFill) {
      return false
    }

    // For stroked elements, check minimum width threshold
    if (hasStroke) {
      const strokeWidth = parseFloat(styles.strokeWidth) || 1

      return strokeWidth >= minStrokeWidth
    }

    // For filled elements, check brightness (gradient fills always pass)
    if (fill.startsWith("url(")) {
      return true
    }

    const brightness = getColorBrightness(fill) ?? 0
    const [minBrightness, maxBrightness] = fillBrightness

    return brightness >= minBrightness && brightness <= maxBrightness
  }

  drawElement(element, tolerance = 0.5, scaleFactor = 1) {
    const tagName = element.tagName.toLowerCase()

    switch (tagName) {
      case "path":
        return this.drawPath(element, tolerance, scaleFactor)
      case "line":
        return this.drawLine(element)
      case "polyline":
        return this.drawPolyline(element, false)
      case "polygon":
        return this.drawPolyline(element, true)
      case "rect":
        return this.drawRect(element)
      case "circle":
        return this.drawCircle(element)
      case "ellipse":
        return this.drawEllipse(element)
      default:
        return null
    }
  }

  // <path d="..."> - use points-on-path for Bezier linearization
  // Returns array of paths (one per subpath in d attribute)
  // For small SVGs, scales path data up before processing for better precision
  drawPath(element, tolerance = 0.5, scaleFactor = 1) {
    const d = element.getAttribute("d")

    if (!d) {
      return null
    }

    try {
      // Scale up path data for small SVGs to get better precision from points-on-path.
      // Vertices returned at scaled size - parseSVG handles CTM transform adjustments.
      const scaledD =
        scaleFactor > 1 ? svgpath(d).scale(scaleFactor).toString() : d

      const distance = 0.5
      const pointArrays = pointsOnPath(scaledD, tolerance, distance)

      return pointArrays
        .filter((points) => points.length > 0)
        .map((points) => points.map((pt) => new Victor(pt[0], pt[1])))
    } catch (e) {
      if (DEBUG) console.warn("Malformed path: ", d, e)
      return null
    }
  }

  // <line x1="" y1="" x2="" y2="">
  // Subsample long edges to avoid outlier detection filtering
  drawLine(element) {
    const x1 = parseFloat(element.getAttribute("x1")) || 0
    const y1 = parseFloat(element.getAttribute("y1")) || 0
    const x2 = parseFloat(element.getAttribute("x2")) || 0
    const y2 = parseFloat(element.getAttribute("y2")) || 0

    return subsample([new Victor(x1, y1), new Victor(x2, y2)], SUBSAMPLE_LENGTH)
  }

  // <polyline points=""> or <polygon points="">
  // Subsample long edges to avoid outlier detection filtering
  drawPolyline(element, close) {
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
  drawRect(element) {
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

    return this.buildRoundedRectPath(x, y, width, height, rx, ry)
  }

  // Build a closed path for a rounded rectangle with corner arcs
  buildRoundedRectPath(x, y, width, height, rx, ry) {
    const vertices = []
    const resolution = CORNER_RESOLUTION

    // Subsample straight edges to match arc segment density
    const arcLength = (Math.PI / 2) * Math.max(rx, ry)
    const edgeSubsampleLength = arcLength / resolution

    // Top edge (left to right)
    vertices.push(
      ...subsample(
        [new Victor(x + rx, y), new Victor(x + width - rx, y)],
        edgeSubsampleLength,
      ),
    )

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
    vertices.push(
      ...subsample(
        [new Victor(x + width, y + ry), new Victor(x + width, y + height - ry)],
        edgeSubsampleLength,
      ),
    )

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
    vertices.push(
      ...subsample(
        [
          new Victor(x + width - rx, y + height),
          new Victor(x + rx, y + height),
        ],
        edgeSubsampleLength,
      ),
    )

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
    vertices.push(
      ...subsample(
        [new Victor(x, y + height - ry), new Victor(x, y + ry)],
        edgeSubsampleLength,
      ),
    )

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

    return vertices
  }

  // <circle cx="" cy="" r="">
  drawCircle(element) {
    const cx = parseFloat(element.getAttribute("cx")) || 0
    const cy = parseFloat(element.getAttribute("cy")) || 0
    const r = parseFloat(element.getAttribute("r")) || 0

    if (r <= 0) {
      return null
    }

    return circle(r, 0, cx, cy, CURVE_RESOLUTION)
  }

  // <ellipse cx="" cy="" rx="" ry="">
  drawEllipse(element) {
    const cx = parseFloat(element.getAttribute("cx")) || 0
    const cy = parseFloat(element.getAttribute("cy")) || 0
    const rx = parseFloat(element.getAttribute("rx")) || 0
    const ry = parseFloat(element.getAttribute("ry")) || 0

    if (rx <= 0 || ry <= 0) {
      return null
    }

    return ellipse(rx, ry, cx, cy, CURVE_RESOLUTION)
  }

  // Creates a node object for the graph that uses snapped coordinates as its key.
  // The custom toString() returns quantized coordinates, so nearby points (within tolerance)
  // produce the same key and are treated as the same node - enabling edge merging at junctions.
  // The node retains original (x, y) for accurate vertex output.
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
      const medianLength = median(segmentLengths)
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

      if (startPt.distance(endPt) < CLOSED_PATH_TOLERANCE) {
        const node1 = this.proximityNode(endPt.x, endPt.y, tolerance)
        const node2 = this.proximityNode(startPt.x, startPt.y, tolerance)

        if (node1.toString() !== node2.toString()) {
          graph.addEdge(node1, node2)
        }
      }
    }

    return graph
  }

  // Flatten paths into single vertex array using Chinese Postman algorithm
  // Graph contains ALL vertices and segments from ALL paths (open and closed)
  // CPP finds optimal traversal that covers every segment
  connectPaths(paths) {
    if (paths.length === 0) return []
    if (paths.length === 1) return paths[0].map((v) => cloneVertex(v))

    const graph = this.buildPathGraph(paths, NODE_MERGE_TOLERANCE)

    graph.connectComponents()

    const trail = getEulerianTrail(graph)
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
