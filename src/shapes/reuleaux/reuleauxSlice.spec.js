import reuleaux, {
  setShapeReuleauxSides
} from './reuleauxSlice'

describe('reuleaux reducer', () => {
  it('should handle setShapeReuleauxSides', () => {
    expect(
      reuleaux(
        {reuleaux_sides: 4},
        setShapeReuleauxSides(5)
      )
    ).toEqual({
      reuleaux_sides: 5
    })
  })
})
