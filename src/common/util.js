import { keyBy, compact } from "lodash"

export const difference = (a, b) => {
  // eslint-disable-next-line no-undef
  return new Set([
    ...[...a].filter((x) => !b.has(x)),
    ...[...b].filter((x) => !a.has(x)),
  ])
}

// round a given number n to p number of digits
export const roundP = (n, p) => {
  return Math.round((n + Number.EPSILON) * Math.pow(10, p)) / Math.pow(10, p)
}

// https://stackoverflow.com/a/4652513
export const reduce = (numerator, denominator) => {
  let gcd = (a, b) => {
    return b ? gcd(b, a % b) : a
  }

  gcd = gcd(numerator, denominator)
  return [numerator / gcd, denominator / gcd]
}

// rotates an array count times
// taken from https://stackoverflow.com/questions/1985260/rotate-the-elements-in-an-array-in-javascript#33451102
export const arrayRotate = (arr, count) => {
  count -= arr.length * Math.floor(count / arr.length)
  arr.push.apply(arr, arr.splice(0, count))
  return arr
}

// Helper function to take a string and make the user download a text file with that text as the
// content. I don't really understand this, but I took it from here, and it seems to work:
// https://stackoverflow.com/a/18197511
export const downloadFile = (
  fileName,
  text,
  fileType = "text/plain;charset=utf-8",
) => {
  let link = document.createElement("a")
  link.download = fileName

  let blob = new Blob([text], { type: fileType })

  // Windows Edge fix
  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(blob, fileName)
  } else {
    link.href = URL.createObjectURL(blob)
    if (document.createEvent) {
      var event = document.createEvent("MouseEvents")
      event.initEvent("click", true, true)
      link.dispatchEvent(event)
    } else {
      link.click()
    }
    URL.revokeObjectURL(link.href)
  }
}

// returns an ordered list of objects based on a given key
export const orderByKey = (keys, objects, keyName = "id") => {
  const objectMap = keyBy(objects, keyName)
  return compact(keys.map((key) => objectMap[key]))
}

// given a delta values from a mouse wheel, returns the equivalent layer delta.
// when shift key is pressed, this is apparently "horizontal" scrolling by the browser;
// for us, it means we'll grow in increments of 1
export const scaleByWheel = (size, deltaX, deltaY) => {
  const signX = Math.sign(deltaX)
  const signY = Math.sign(deltaY)

  if (deltaX) {
    return size + 1 * signX
  } else {
    const scale = 1 + (Math.log(Math.abs(deltaY)) / 30) * signY
    let newSize = Math.max(roundP(size * scale, 0), 1)

    if (newSize === size) {
      // if the log scaled value isn't big enough to move the scale
      newSize = Math.max(signY + size, 1)
    }

    return newSize
  }
}

// convenience method to handle invocation of a function when present
export const functionValue = (val, arg1, arg2) => {
  return typeof val === "function" ? val(arg1, arg2) : val
}

// shared logic via mixins
export const mixin = (targetClass, mixinClass) => {
  Object.getOwnPropertyNames(mixinClass.prototype).forEach((name) => {
    if (name !== "constructor") {
      targetClass.prototype[name] = mixinClass.prototype[name]
    }
  })
}
