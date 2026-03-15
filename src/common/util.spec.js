import { median } from "./util"

describe("median", () => {
  it("returns 0 for empty array", () => {
    expect(median([])).toBe(0)
  })

  it("returns the single element for array of length 1", () => {
    expect(median([5])).toBe(5)
    expect(median([42])).toBe(42)
  })

  it("returns middle element for odd-length array", () => {
    expect(median([1, 2, 3])).toBe(2)
    expect(median([1, 2, 3, 4, 5])).toBe(3)
  })

  it("returns average of two middle elements for even-length array", () => {
    expect(median([1, 2, 3, 4])).toBe(2.5)
    expect(median([1, 2])).toBe(1.5)
  })

  it("handles unsorted input", () => {
    expect(median([3, 1, 2])).toBe(2)
    expect(median([5, 1, 3, 2, 4])).toBe(3)
    expect(median([4, 1, 3, 2])).toBe(2.5)
  })

  it("does not modify the original array", () => {
    const arr = [3, 1, 2]
    median(arr)
    expect(arr).toEqual([3, 1, 2])
  })

  it("handles negative numbers", () => {
    expect(median([-3, -1, -2])).toBe(-2)
    expect(median([-5, 0, 5])).toBe(0)
  })

  it("handles floating point numbers", () => {
    expect(median([1.5, 2.5, 3.5])).toBe(2.5)
    expect(median([1.1, 2.2, 3.3, 4.4])).toBeCloseTo(2.75)
  })

  it("handles duplicate values", () => {
    expect(median([1, 1, 1])).toBe(1)
    expect(median([1, 2, 2, 3])).toBe(2)
  })
})
