export const difference = (a, b) => {
  // eslint-disable-next-line no-undef
  return new Set(
    [
      ...[...a].filter(x => !b.has(x)),
      ...[...b].filter(x => !a.has(x))
    ]
  )
}

// round a given number n to p number of digits
export const roundP = (n, p) => {
  return Math.round((n + Number.EPSILON) * Math.pow(10, p)) / Math.pow(10, p)
}

// https://stackoverflow.com/a/4652513
export const reduce = (numerator, denominator) => {
  let gcd = (a,b) => {
    return b ? gcd(b, a%b) : a;
  }

  gcd = gcd(numerator, denominator)
  return [numerator/gcd, denominator/gcd]
}

// rotates an array count times
// taken from https://stackoverflow.com/questions/1985260/rotate-the-elements-in-an-array-in-javascript#33451102
export const arrayRotate = (arr, count) => {
  count -= arr.length * Math.floor(count / arr.length)
  arr.push.apply(arr, arr.splice(0, count))
  return arr
}

// set to true to turn on console logging
const debug = false
export const log = (message) => {
  if (debug) { console.log(message) }
}
