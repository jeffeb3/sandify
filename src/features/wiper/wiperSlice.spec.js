import wiper, {
  setWiperAngleDeg,
  setWiperSize
} from './wiperSlice'

describe('wiper reducer', () => {
  it('should handle initial state', () => {
    expect(wiper(undefined, {})).toEqual({
      angle_deg: 15,
      size: 12
    })
  })

  it('should handle setWiperAngleDeg', () => {
    expect(
      wiper(
        {angle_deg: 15},
        setWiperAngleDeg(100)
      )
    ).toEqual({
      angle_deg: 100
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
