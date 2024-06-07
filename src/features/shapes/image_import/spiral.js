import { pixelProcessor } from "./helpers"
import Victor from "victor"

const spiral = (config, data) => {
  const getPixel = pixelProcessor(config, data)
  let r = 5
  let a = 0
  const cx = config.width / 2
  const cy = config.height / 2
  let points = []

  points.push(new Victor(cx, config.height - cy))

  let x = cx,
    y = cy
  let radius = 1
  let theta = 0

  while (x > 0 && y > 0 && x < config.width && y < config.height) {
    const z = getPixel(x, y)
    r = config.Amplitude * z * 0.02 * config.Spacing
    a += z / config.Frequency

    let tempradius = radius + Math.sin(a) * r

    points.push(
      new Victor(
        cx + tempradius * Math.sin(theta),
        config.height - (cy + tempradius * Math.cos(theta)),
      ),
    )

    let incr = Math.asin(1 / radius)
    radius += incr * config.Spacing
    theta += incr

    x = Math.floor(cx + radius * Math.sin(theta))
    y = Math.floor(cy + radius * Math.cos(theta))
  }

  return points
}

export default spiral
