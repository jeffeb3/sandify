import transforms, {
  setXFormOffsetX,
  setXFormOffsetY,
  setNumLoops,
  toggleSpin,
  setSpin,
  setSpinSwitchbacks,
  toggleGrow,
  setGrow,
  toggleTrack,
  toggleTrackGrow,
  setTrack,
  setTrackLength,
  setTrackGrow
} from './transformsSlice'

describe('transforms reducer', () => {
  it('should handle initial state', () => {
    expect(transforms(undefined, {})).toEqual({
      xformOffsetX: 0.0,
      xformOffsetY: 0.0,
      numLoops: 10,
      growEnabled: true,
      growValue: 100,
      spinEnabled: false,
      spinValue: 2,
      spinSwitchbacks: 0,
      trackEnabled: false,
      trackGrowEnabled: false,
      trackValue: 10,
      trackLength: 0.2,
      trackGrow: 50.0,
    })
  })

  it('should handle setXFormOffsetX', () => {
    expect(
      transforms(
        {xformOffsetX: 0.0},
        setXFormOffsetX('2')
      )
    ).toEqual({
      xformOffsetX: 2.0
    })
  })

  it('should handle setXFormOffsetY', () => {
    expect(
      transforms(
        {xformOffsetY: 0.0},
        setXFormOffsetY('2')
      )
    ).toEqual({
      xformOffsetY: 2.0
    })
  })

  it('should handle setNumLoops', () => {
    expect(
      transforms(
        {numLoops: 10},
        setNumLoops(20)
      )
    ).toEqual({
      numLoops: 20
    })
  })

  it('should handle toggleSpin', () => {
    expect(
      transforms(
        {spinEnabled: false},
        toggleSpin({})
      )
    ).toEqual({
      spinEnabled: true
    })
  })

  it('should handle setSpin', () => {
    expect(
      transforms(
        {spinValue: 2},
        setSpin(5)
      )
    ).toEqual({
      spinValue: 5
    })
  })

  it('should handle setSpinSwitchbacks', () => {
    expect(
      transforms(
        {spinSwitchbacks: 0},
        setSpinSwitchbacks(2)
      )
    ).toEqual({
      spinSwitchbacks: 2
    })
  })

  it('should handle toggleGrow', () => {
    expect(
      transforms(
        {growEnabled: false},
        toggleGrow({})
      )
    ).toEqual({
      growEnabled: true
    })
  })

  it('should handle setGrow', () => {
    expect(
      transforms(
        {growValue: 100},
        setGrow(20)
      )
    ).toEqual({
      growValue: 20
    })
  })

  it('should handle toggleTrack', () => {
    expect(
      transforms(
        {trackEnabled: false},
        toggleTrack({})
      )
    ).toEqual({
      trackEnabled: true
    })
  })

  it('should handle toggleTrackGrow', () => {
    expect(
      transforms(
        {trackGrowEnabled: false},
        toggleTrackGrow({})
      )
    ).toEqual({
      trackGrowEnabled: true
    })
  })

  it('should handle setTrack', () => {
    expect(
      transforms(
        {trackValue: 10},
        setTrack(20)
      )
    ).toEqual({
      trackValue: 20
    })
  })

  it('should handle setTrackLength', () => {
    expect(
      transforms(
        {trackLength: 0.2},
        setTrackLength(0.4)
      )
    ).toEqual({
      trackLength: 0.4
    })
  })

  it('should handle setTrackGrow', () => {
    expect(
      transforms(
        {trackGrow: 50.0},
        setTrackGrow(20.0)
      )
    ).toEqual({
      trackGrow: 20.0
    })
  })
})
