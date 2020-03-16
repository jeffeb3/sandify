import polygon, {
  setShapePolygonSides
} from './polygonSlice'

describe('polygon reducer', () => {
  it('should handle setShapePolygonSides', () => {
    expect(
      polygon(
        {polygon_sides: 4},
        setShapePolygonSides(5)
      )
    ).toEqual({
      polygon_sides: 5
    })
  })
})
