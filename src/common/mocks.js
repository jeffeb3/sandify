// mock implementation of lodash uniqueId, so that we can reset during tests
const idCounter = {}

export default function uniqueId(prefix='$lodash$') {
  if (!idCounter[prefix]) {
    idCounter[prefix] = 0
  }

  const id =++idCounter[prefix]
  if (prefix === '$lodash$') {
    return `${id}`
  }

  return `${prefix}${id}`
}

export const resetUniqueIds = () => {
  Object.keys(idCounter).forEach(key => delete idCounter[key])
}
