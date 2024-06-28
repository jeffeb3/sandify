import { pixelProcessor, buildLines } from "./helpers"
import Victor from "victor"

const squiggle = (config, data) => {
  return buildLines(buildLine, config, data)
}

const buildLine = (y, config, data) => {
  const getPixel = pixelProcessor(config, data)
  const lineCount = config.LineCount
  const amplitude = config.Amplitude
  const frequency = config.Frequency
  const incr_x = config.Sampling
  const AM = config.Modulation != "FM"
  const FM = config.Modulation != "AM"

  let a = 0
  const vertices = []

  for (let x = 0; x <= config.width; x += incr_x) {
    let z = getPixel(x, y)
    let r = (amplitude * (AM ? z : 255)) / lineCount

    a += (FM ? z : 255) / frequency

    vertices.push([new Victor(x, config.height - (y + Math.sin(a) * r)), z])
  }

  return vertices
}

export default squiggle
