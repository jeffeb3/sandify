import { pixelProcessor, joinLines } from "./helpers"
import Victor from "victor"

const springs = (config, data) => {
  const getPixel = pixelProcessor(config, data)
  const direction = config.Direction == "clockwise" ? 1 : -1
  const pi = Math.PI
  const freq = ((config.Frequency * config.LineCount) / 2000) * direction
  const amplitude = config.Amplitude / config.LineCount
  const incr_x = config.Sampling
  const incr_y = Math.floor(config.height / config.LineCount)
  const lines = []

  for (let y = 0; y < config.height; y += incr_y) {
    let line = []
    let phase = 0

    for (let x = 0; x <= config.width; x += incr_x) {
      let a = amplitude * getPixel(x, y)

      phase += freq
      if (phase > pi) phase -= 2 * pi

      line.push(
        new Victor(
          x + a * Math.cos(phase),
          config.height - (y + a * Math.sin(phase)),
        ),
      )
    }

    lines.push(line)
  }

  return joinLines(lines)
}

export default springs
