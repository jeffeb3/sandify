import shape, {
  setCurrentShape,
  setShapeStartingSize,
} from './shapeSlice'

describe('shapes reducer', () => {
  it('should handle initial state', () => {
    expect(shape(undefined, {})).toEqual({
      current_shape: "Polygon",
      star_points: 5,
      star_ratio: 0.5,
      circle_lobes: 1,
      polygon_sides: 4,
      reuleaux_sides: 3,
      input_font: "Cursive",
      input_text: "Sandify",
      starting_size: 10.0,
      epicycloid_a: 1.0,
      epicycloid_b: .25,
      hypocycloid_a: 1.5,
      hypocycloid_b: .25,
      rose_n: 3,
      rose_d: 2
    })
  })

  it('should handle setCurrentShape', () => {
    expect(
      shape(
        {current_shape: 'Polygon'},
        setCurrentShape('Heart')
      )
    ).toEqual({
      current_shape: 'Heart'
    })
  })

  it('should handle setShapeStartingSize', () => {
    expect(
      shape(
        {starting_size: 10.0},
        setShapeStartingSize(20.0)
      )
    ).toEqual({
      starting_size: 20.0
    })
  })
})
