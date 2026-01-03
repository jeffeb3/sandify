import { PriorityQueue } from "./PriorityQueue"

describe("PriorityQueue", () => {
  it("dequeues elements in priority order", () => {
    const pq = new PriorityQueue()
    pq.enqueue(["c", 3])
    pq.enqueue(["a", 1])
    pq.enqueue(["b", 2])

    expect(pq.dequeue()).toEqual(["a", 1])
    expect(pq.dequeue()).toEqual(["b", 2])
    expect(pq.dequeue()).toEqual(["c", 3])
  })

  it("handles empty queue", () => {
    const pq = new PriorityQueue()
    expect(pq.isEmpty()).toBe(true)
    expect(pq.dequeue()).toBeUndefined()
  })

  it("handles single element", () => {
    const pq = new PriorityQueue()
    pq.enqueue(["only", 1])
    expect(pq.isEmpty()).toBe(false)
    expect(pq.dequeue()).toEqual(["only", 1])
    expect(pq.isEmpty()).toBe(true)
  })

  it("handles duplicate priorities", () => {
    const pq = new PriorityQueue()
    pq.enqueue(["first", 1])
    pq.enqueue(["second", 1])

    const results = [pq.dequeue(), pq.dequeue()]
    expect(results).toContainEqual(["first", 1])
    expect(results).toContainEqual(["second", 1])
  })
})
