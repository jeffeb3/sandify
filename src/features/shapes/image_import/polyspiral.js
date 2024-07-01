import { pixelProcessor } from "./helpers"
import Victor from "victor"

const polyspiral = (config, data) => {
  const getPixel = pixelProcessor(config, data)
  let r = 5
  let a = 0
  const cx = config.width / 2
  const cy = config.height / 2
  let points = []

  points.push(new Victor(cx, config.height - cy))

  let x = cx,
    y = cy
  let theta = 0
  let travelled = 0
  let segmentLength = 1
  const pi = Math.PI
  let incrTheta = (2 * pi) / config.Polygon
  let incrLength = Math.round(10 / config.Polygon)

  while (x > 0 && y > 0 && x < config.width && y < config.height) {
    const z = getPixel(x, y)
    r = config.Amplitude * z * 0.02 * config.Spacing
    a += z / config.Frequency

    let displacement = Math.sin(a) * r

    points.push(
      new Victor(
        x - displacement * Math.sin(theta),
        config.height - (y + displacement * Math.cos(theta)),
      ),
    )

    if (++travelled >= segmentLength) {
      travelled = 0
      theta += incrTheta
      segmentLength += incrLength
    }

    x += config.Spacing * Math.cos(theta)
    y += config.Spacing * Math.sin(theta)
  }

  return points
}

export default polyspiral
