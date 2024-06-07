import { pixelProcessor, joinLines } from "./helpers"
import Victor from "victor"

const sawtooth = (config, data) => {
  const getPixel = pixelProcessor(config, data)
  const lineCount = config.LineCount
  const amplitude = config.Amplitude / 3.141
  const frequency = config.Frequency
  const incr_x = config.Sampling
  const incr_y = Math.floor(config.height / lineCount)
  const lines = []

  for (let y = 0; y < config.height; y += incr_y) {
    let a = 0
    let line = []

    for (let x = 0; x <= config.width; x += incr_x) {
      let z = getPixel(x, y)
      let r = (amplitude * z) / lineCount

      a += z / frequency
      if (a > 6.35) a -= 6.35
      line.push(new Victor(x, config.height - (y + a * r)))
    }

    lines.push(line)
  }

  return joinLines(lines)
}

export default sawtooth
