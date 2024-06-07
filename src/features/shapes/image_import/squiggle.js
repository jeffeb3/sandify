import { pixelProcessor, joinLines } from "./helpers"
import Victor from "victor"

const squiggle = (config, data) => {
  const getPixel = pixelProcessor(config, data)
  const lineCount = config.LineCount
  const amplitude = config.Amplitude
  const frequency = config.Frequency
  const incr_x = config.Sampling
  const incr_y = Math.floor(config.height / lineCount)
  const AM = config.Modulation != "FM"
  const FM = config.Modulation != "AM"
  const lines = []

  for (let y = 0; y < config.height; y += incr_y) {
    let a = 0
    let line = []

    for (let x = 0; x <= config.width; x += incr_x) {
      let z = getPixel(x, y)
      let r = (amplitude * (AM ? z : 255)) / lineCount

      a += (FM ? z : 255) / frequency
      line.push(new Victor(x, config.height - (y + Math.sin(a) * r)))
    }

    lines.push(line)
  }

  return joinLines(lines)
}

export default squiggle
