import { pixelProcessor, joinLines } from "./helpers"
import Victor from "victor"

const waves = (config, data) => {
  const getPixel = pixelProcessor(config, data)
  const pi = Math.PI
  const cos = Math.cos((config.Angle / 180) * pi)
  const sin = Math.sin((config.Angle / 180) * pi)
  const a = config.StepSize
  const w = config.width
  const h = config.height
  const L = Math.sqrt(w * w + h * h)

  let left = [],
    right = []
  let lastline,
    line = []

  function inside(x, y) {
    return x >= 0 && y >= 0 && x < w && y < h
  }

  function pix(x, y) {
    return inside(x, y)
      ? ((255 - getPixel(Math.floor(x), Math.floor(y))) * a) / 255
      : 0
  }

  // initial straight line
  let x = (w - L * cos) / 2
  let y = (h - L * sin) / 2

  for (let i = 0; i < L; i++) {
    x += cos
    y += sin
    line.push(new Victor(x, y))
  }

  left.push(line)

  for (let j = 0; j < L / 2 / a; j++) {
    lastline = line
    line = []

    for (let i = 0; i < L; i++) {
      x = lastline[i].x + sin * a
      y = lastline[i].y - cos * a
      let z = pix(x, y)

      x += sin * z
      y -= cos * z
      line.push(new Victor(x, y))
    }

    left.push(line)
  }

  line = left[0]

  for (let j = 0; j < L / 2 / a; j++) {
    lastline = line
    line = []

    for (let i = 0; i < L; i++) {
      x = lastline[i].x - sin * a
      y = lastline[i].y + cos * a
      let z = pix(x, y)

      x -= sin * z
      y += cos * z
      line.push(new Victor(x, y))
    }

    right.push(line)
  }

  right.reverse()

  let temp = right.concat(left)
  let output = []

  for (let i = 0; i < temp.length; i++) {
    let line = temp[i]
    let newline = []

    for (let j = 0; j < line.length; j++) {
      if (inside(line[j].x, line[j].y)) newline.push(line[j])
    }
    if (newline.length > 1) output.push(newline)
  }

  output.forEach((line) => {
    line.forEach((vertex) => {
      vertex.y = h - vertex.y
    })
  })

  return joinLines(output)
}

export default waves
