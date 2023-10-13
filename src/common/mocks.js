let counter = 0

const uniqueId = () => {
  counter++
  return counter.toString()
}

export const resetUniqueId = (start = 0) => {
  counter = start
}

jest.mock("uuid", () => ({ v4: () => uniqueId() }))
