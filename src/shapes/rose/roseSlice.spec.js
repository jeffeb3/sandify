import rose, {
  setShapeRoseN,
  setShapeRoseD
} from './roseSlice'

describe('rose reducer', () => {
  it('should handle setShapeRoseN', () => {
    expect(
      rose(
        {rose_n: 3},
        setShapeRoseN(2)
      )
    ).toEqual({
      rose_n: 2
    })
  })

  it('should handle setShapeRoseD', () => {
    expect(
      rose(
        {rose_d: 2},
        setShapeRoseD(3)
      )
    ).toEqual({
      rose_d: 3
    })
  })
})
