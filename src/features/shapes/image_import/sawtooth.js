import { pixelProcessor, buildLines } from "./helpers"
import Victor from "victor"

const sawtooth = (config, data) => {
  return buildLines(buildLine, config, data)
}

const buildLine = (y, config, data) => {
  const getPixel = pixelProcessor(config, data)
  const lineCount = config.LineCount
  const amplitude = config.Amplitude / 3.141
  const frequency = config.Frequency
  const incr_x = config.Sampling

  let a = 0
  const vertices = []

  for (let x = 0; x <= config.width; x += incr_x) {
    const z = getPixel(x, y)
    let r = (amplitude * z) / lineCount

    a += z / frequency
    if (a > 6.35) a -= 6.35

    vertices.push([new Victor(x, config.height - (y + a * r)), z])
  }

  return vertices
}

export default sawtooth
