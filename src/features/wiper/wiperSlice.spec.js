import wiper, {
  setWiperAngleDeg,
  setWiperSize
} from './wiperSlice'

describe('wiper reducer', () => {
  it('should handle initial state', () => {
    expect(wiper(undefined, {})).toEqual({
      angleDeg: 15,
      size: 12
    })
  })

  it('should handle setWiperAngleDeg', () => {
    expect(
      wiper(
        {angleDeg: 15},
        setWiperAngleDeg(100)
      )
    ).toEqual({
      angleDeg: 100
    })
  })

  it('should handle setWiperSize', () => {
    expect(
      wiper(
        {size: 12},
        setWiperSize(100)
      )
    ).toEqual({
      size: 100
    })
  })
})
