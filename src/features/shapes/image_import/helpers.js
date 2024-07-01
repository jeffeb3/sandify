import {
  cloneVertex,
  concatClonedVertices,
  nearestVertex,
} from "@/common/geometry"

export const pixelProcessor = (config, imagePixels) => {
  const width = parseInt(config.width)
  const contrast = parseInt(config.Contrast)
  const brightness = parseInt(config.Brightness)
  const minBrightness = parseInt(config.MinBrightness)
  const maxBrightness = parseInt(config.MaxBrightness)
  const black = config.Inverted
  let contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast))

  return function (x, y) {
    let b
    let pixIndex = Math.floor(x) + Math.floor(y) * width

    if (contrast !== 0) {
      b =
        0.2125 *
          (contrastFactor * (imagePixels.data[4 * pixIndex] - 128) +
            128 +
            brightness) +
        0.7154 *
          (contrastFactor * (imagePixels.data[4 * pixIndex + 1] - 128) +
            128 +
            brightness) +
        0.0721 *
          (contrastFactor * (imagePixels.data[4 * pixIndex + 2] - 128) +
            128 +
            brightness)
    } else {
      b =
        0.2125 * (imagePixels.data[4 * pixIndex] + brightness) +
        0.7154 * (imagePixels.data[4 * pixIndex + 1] + brightness) +
        0.0721 * (imagePixels.data[4 * pixIndex + 2] + brightness)
    }

    if (black) {
      b = Math.min(255 - minBrightness, 255 - b)
    } else {
      b = Math.max(minBrightness, b)
    }

    return Math.max(maxBrightness - b, 0)
  }
}

export const joinLines = (lines) => {
  let reverse = false
  const newLines = []

  lines.forEach((line) => {
    if (reverse) {
      line = line.reverse()
    }
    newLines.push(line)
    reverse = !reverse
  })

  return newLines.flat()
}

export const buildSegments = (y, algorithm, config, data) => {
  const segments = []
  const tuples = algorithm(y, config, data)
  let segment = []

  tuples.forEach((tuple) => {
    const vertex = tuple[0]
    const z = tuple[1]

    if (z <= config.MaxClippedBrightness && z >= config.MinClippedBrightness) {
      segment.push(vertex)
    } else if (segment.length > 0) {
      segments.push(segment)
      segment = []
    }
  })

  if (segment.length > 0) {
    segments.push(segment)
  }

  return segments
}

export const buildLines = (algorithm, config, data) => {
  const lineCount = config.LineCount
  let incr_y = Math.floor(config.height / lineCount)
  const segmentGroups = []
  const lines = []

  for (let y = 0; y < config.height; y += incr_y) {
    segmentGroups.push(buildSegments(y, algorithm, config, data))
  }

  segmentGroups.forEach((group, index) => {
    if (group.length == 0) {
      // empty
      lines.push([])
    } else {
      const vertices = group[0].map((vertex) => cloneVertex(vertex))

      if (group.length > 1) {
        // multiple segments that we need to connect
        for (let i = 0; i < group.length - 1; i++) {
          connectSegments(group[i], group[i + 1], vertices, lines, index)
        }
      }

      lines.push(vertices)
    }
  })

  return joinLines(lines)
}

export const connectSegments = (segment1, segment2, vertices, lines, index) => {
  let prevLine = lines[index - 1]

  if (prevLine) {
    const e1 = segment1[segment1.length - 1]
    const s2 = segment2[0]
    const sp = nearestVertex(e1, prevLine)
    const ep = nearestVertex(s2, prevLine) + 1
    const connector = prevLine.slice(sp, ep)

    concatClonedVertices(vertices, connector)
  }

  segment2.forEach((vertex) => vertices.push(cloneVertex(vertex)))
}
