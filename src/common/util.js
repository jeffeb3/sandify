export const difference = (a, b) => {
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
