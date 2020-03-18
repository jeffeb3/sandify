import star, {
  setShapeStarPoints,
  setShapeStarRatio
} from './starSlice'

describe('star reducer', () => {
  it('should handle setShapeStarPoints', () => {
    expect(
      star(
        {star_points: 5},
        setShapeStarPoints(4)
      )
    ).toEqual({
      star_points: 4
    })
  })

  it('should handle setShapeStarRatio', () => {
    expect(
      star(
        {star_ratio: 0.5},
        setShapeStarRatio(0.25)
      )
    ).toEqual({
      star_ratio: 0.25
    })
  })
})
