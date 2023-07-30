let counter = 0

const uniqueId = () => {
  counter++
  return counter.toString()
}

export const resetUniqueId = () => {
  counter = 0
}

jest.mock("uuid", () => ({ v4: () => uniqueId() }))
