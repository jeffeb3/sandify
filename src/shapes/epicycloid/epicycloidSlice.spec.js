import epicycloid, {
  setShapeEpicycloidA,
  setShapeEpicycloidB
} from './epicycloidSlice'

describe('epicycloid reducer', () => {
  it('should handle setShapeEpicycloidA', () => {
    expect(
      epicycloid(
        {epicycloid_a: 1},
        setShapeEpicycloidA(2)
      )
    ).toEqual({
      epicycloid_a: 2
    })
  })

  it('should handle setShapeEpicycloidB', () => {
    expect(
      epicycloid(
        {epicycloid_b: 0.25},
        setShapeEpicycloidB(0.5)
      )
    ).toEqual({
      epicycloid_b: 0.5
    })
  })
})
