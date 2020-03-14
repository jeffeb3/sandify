import shapes, {
  addShape,
  setCurrentShape,
  setShapeStartingSize,
} from './shapesSlice'

describe('shapes reducer', () => {
  it('should handle initial state', () => {
    expect(shapes(undefined, {})).toEqual({
      shapes: [],
      current_shape: "Polygon",
      polygon_sides: 4,
      star_points: 5,
      star_ratio: 0.5,
      circle_lobes: 1,
      reuleaux_sides: 3,
      input_text: "Sandify",
      starting_size: 10.0,
      epicycloid_a: 1.0,
      epicycloid_b: .25,
      hypocycloid_a: 1.0,
      hypocycloid_b: .25,
      rose_n: 3,
      rose_d: 2
    })
  })

  it('should handle addShape', () => {
    expect(
      shapes(
        {shapes: [{name: 'Web'}]},
        addShape({name: 'Heart'})
      )
    ).toEqual({
      shapes: [{name: 'Web'},{name: 'Heart'}]
    })
  })

  it('should handle setCurrentShape', () => {
    expect(
      shapes(
        {current_shape: 'Polygon'},
        setCurrentShape('Heart')
      )
    ).toEqual({
      current_shape: 'Heart'
    })
  })

  it('should handle setShapeStartingSize', () => {
    expect(
      shapes(
        {starting_size: 10.0},
        setShapeStartingSize(20.0)
      )
    ).toEqual({
      starting_size: 20.0
    })
  })
})
