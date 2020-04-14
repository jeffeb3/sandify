import RectMachine from './rectMachine'

describe('rect machine', () => {
  let machine

  beforeEach(() => {
    machine = new RectMachine([], {minX: 0, maxX: 500, minY: 0, maxY: 500})
  })

  describe('tracePerimeter', () => {
    it('when points on the same line, no connecting points needed', () => {
      let p1 = {x: 50, y: -250}
      let p2 = {x: 100, y: -250}
      expect(machine.tracePerimeter(p1, p2)).toEqual([])
    })

    it('when points have different orientations, gives a single connecting corner', () => {
      expect(machine.tracePerimeter({x: 50, y: -250}, {x: 250, y: -50})).toEqual([{x: 250, y: -250}])
      expect(machine.tracePerimeter({x: -50, y: -250}, {x: 250, y: -50})).toEqual([{x: 250, y: -250}])
    })

    it('when points have the same orientations on different lines, gives two connecting corners', () => {
      expect(machine.tracePerimeter({x: -50, y: -250}, {x: -50, y: 250})).toEqual([{x: -250, y: -250}, {x: -250, y: 250}])
      expect(machine.tracePerimeter({x: 100, y: -250}, {x: 100, y: 250})).toEqual([{x: 250, y: -250}, {x: 250, y: 250}])
      expect(machine.tracePerimeter({x: 100, y: 250}, {x: 100, y: -250})).toEqual([{x: 250, y: 250}, {x: 250, y: -250}])

      expect(machine.tracePerimeter({x: -250, y: 50}, {x: 250, y: 50})).toEqual([{x: -250, y: 250}, {x: 250, y: 250}])
      expect(machine.tracePerimeter({x: -250, y: -50}, {x: 250, y: -50})).toEqual([{x: -250, y: -250}, {x: 250, y: -250}])
      expect(machine.tracePerimeter({x: 250, y: -50}, {x: -250, y: -50})).toEqual([{x: 250, y: -250}, {x: -250, y: -250}])
    })
  })
})
