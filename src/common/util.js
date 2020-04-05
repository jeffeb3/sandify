export const difference = function(c1, c2) {
  return c1.filter(x => !c2.includes(x)).concat(c2.filter(x => !c1.includes(x)))
}
