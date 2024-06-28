import { pixelProcessor, buildLines } from "./helpers"
import Victor from "victor"

const springs = (config, data) => {
  return buildLines(buildLine, config, data)
}

const buildLine = (y, config, data) => {
  const getPixel = pixelProcessor(config, data)
  const direction = config.Direction == "clockwise" ? 1 : -1
  const pi = Math.PI
  const freq = ((config.Frequency * config.LineCount) / 2000) * direction
  const amplitude = config.Amplitude / config.LineCount
  const incr_x = config.Sampling
  const vertices = []
  let phase = 0

  for (let x = 0; x <= config.width; x += incr_x) {
    const z = getPixel(x, y)
    let a = amplitude * z

    phase += freq
    if (phase > pi) phase -= 2 * pi

    vertices.push([
      new Victor(
        x + a * Math.cos(phase),
        config.height - (y + a * Math.sin(phase)),
      ),
      z,
    ])
  }

  return vertices
}

export default springs
