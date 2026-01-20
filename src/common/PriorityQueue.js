// Binary min-heap priority queue
// Elements are [value, priority] tuples; lower priority = dequeued first
export class PriorityQueue {
  constructor() {
    this.heap = []
  }

  enqueue(element) {
    this.heap.push(element)
    this.bubbleUp(this.heap.length - 1)
  }

  dequeue() {
    if (this.heap.length === 0) return undefined
    if (this.heap.length === 1) return this.heap.pop()

    const min = this.heap[0]

    this.heap[0] = this.heap.pop()
    this.bubbleDown(0)

    return min
  }

  isEmpty() {
    return this.heap.length === 0
  }

  bubbleUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2)

      if (this.heap[parentIndex][1] <= this.heap[index][1]) break
      this.swap(parentIndex, index)
      index = parentIndex
    }
  }

  bubbleDown(index) {
    const length = this.heap.length

    while (true) {
      const leftChild = 2 * index + 1
      const rightChild = 2 * index + 2
      let smallest = index

      if (
        leftChild < length &&
        this.heap[leftChild][1] < this.heap[smallest][1]
      ) {
        smallest = leftChild
      }
      if (
        rightChild < length &&
        this.heap[rightChild][1] < this.heap[smallest][1]
      ) {
        smallest = rightChild
      }

      if (smallest === index) break
      this.swap(index, smallest)
      index = smallest
    }
  }

  swap(i, j) {
    const temp = this.heap[i]

    this.heap[i] = this.heap[j]
    this.heap[j] = temp
  }
}
