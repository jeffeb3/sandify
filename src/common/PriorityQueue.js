export class PriorityQueue {
  constructor() {
    this.collection = []
  }

  enqueue(element) {
    if (this.isEmpty()) {
      this.collection.push(element)
    } else {
      let added = false
      for (let i = 1; i <= this.collection.length; i++) {
        if (element[1] < this.collection[i - 1][1]) {
          this.collection.splice(i - 1, 0, element)
          added = true
          break
        }
      }

      if (!added) {
        this.collection.push(element)
      }
    }
  }

  dequeue() {
    let value = this.collection.shift()
    return value
  }

  isEmpty() {
    return this.collection.length === 0
  }
}
