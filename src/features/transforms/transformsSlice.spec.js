import transforms, {
  setShapeStartingSize,
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
      starting_size: 10.0,
      offset_x: 0.0,
      offset_y: 0.0,
      num_loops: 10,
      grow_enabled: true,
      grow_value: 100,
      spin_enabled: false,
      spin_value: 2,
      spin_switchbacks: 0,
      track_enabled: false,
      track_grow_enabled: false,
      track_value: 10,
      track_length: 0.2,
      track_grow: 50.0,
    })
  })

  it('should handle setShapeStartingSize', () => {
    expect(
      transforms(
        {starting_size: 10.0},
        setShapeStartingSize(20.0)
      )
    ).toEqual({
      starting_size: 20.0
    })
  })

  it('should handle setXFormOffsetX', () => {
    expect(
      transforms(
        {offset_x: 0.0},
        setXFormOffsetX('2')
      )
    ).toEqual({
      offset_x: 2.0
    })
  })

  it('should handle setXFormOffsetY', () => {
    expect(
      transforms(
        {offset_y: 0.0},
        setXFormOffsetY('2')
      )
    ).toEqual({
      offset_y: 2.0
    })
  })

  it('should handle setNumLoops', () => {
    expect(
      transforms(
        {num_loops: 10},
        setNumLoops(20)
      )
    ).toEqual({
      num_loops: 20
    })
  })

  it('should handle toggleSpin', () => {
    expect(
      transforms(
        {spin_enabled: false},
        toggleSpin({})
      )
    ).toEqual({
      spin_enabled: true
    })
  })

  it('should handle setSpin', () => {
    expect(
      transforms(
        {spin_value: 2},
        setSpin(5)
      )
    ).toEqual({
      spin_value: 5
    })
  })

  it('should handle setSpinSwitchbacks', () => {
    expect(
      transforms(
        {spin_switchbacks: 0},
        setSpinSwitchbacks(2)
      )
    ).toEqual({
      spin_switchbacks: 2
    })
  })

  it('should handle toggleGrow', () => {
    expect(
      transforms(
        {grow_enabled: false},
        toggleGrow({})
      )
    ).toEqual({
      grow_enabled: true
    })
  })

  it('should handle setGrow', () => {
    expect(
      transforms(
        {grow_value: 100},
        setGrow(20)
      )
    ).toEqual({
      grow_value: 20
    })
  })

  it('should handle toggleTrack', () => {
    expect(
      transforms(
        {track_enabled: false},
        toggleTrack({})
      )
    ).toEqual({
      track_enabled: true
    })
  })

  it('should handle toggleTrackGrow', () => {
    expect(
      transforms(
        {track_grow_enabled: false},
        toggleTrackGrow({})
      )
    ).toEqual({
      track_grow_enabled: true
    })
  })

  it('should handle setTrack', () => {
    expect(
      transforms(
        {track_value: 10},
        setTrack(20)
      )
    ).toEqual({
      track_value: 20
    })
  })

  it('should handle setTrackLength', () => {
    expect(
      transforms(
        {track_length: 0.2},
        setTrackLength(0.4)
      )
    ).toEqual({
      track_length: 0.4
    })
  })

  it('should handle setTrackGrow', () => {
    expect(
      transforms(
        {track_grow: 50.0},
        setTrackGrow(20.0)
      )
    ).toEqual({
      track_grow: 20.0
    })
  })
})
