import circle, {
  setShapeCircleLobes
} from './circleSlice'

describe('circle reducer', () => {
  it('should handle setShapeCircleLobes', () => {
    expect(
      circle(
        {circle_lobes: 1},
        setShapeCircleLobes(2)
      )
    ).toEqual({
      circle_lobes: 2
    })
  })
})
