import hypocycloid, {
  setShapeHypocycloidA,
  setShapeHypocycloidB
} from './hypocycloidSlice'

describe('hypocycloid reducer', () => {
  it('should handle setShapeHypocycloidA', () => {
    expect(
      hypocycloid(
        {hypocycloid_a: 1},
        setShapeHypocycloidA(2)
      )
    ).toEqual({
      hypocycloid_a: 2
    })
  })

  it('should handle setShapeHypocycloidB', () => {
    expect(
      hypocycloid(
        {hypocycloid_b: 0.25},
        setShapeHypocycloidB(0.5)
      )
    ).toEqual({
      hypocycloid_b: 0.5
    })
  })
})
