export const difference = (c1, c2) => {
  return c1.filter(x => !c2.includes(x)).concat(c2.filter(x => !c1.includes(x)))
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
