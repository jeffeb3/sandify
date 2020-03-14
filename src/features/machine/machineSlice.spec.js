import machine, {
  toggleMachineRectExpanded,
  toggleMachinePolarExpanded,
  setMachineMinX,
  setMachineMaxX,
  setMachineMinY,
  setMachineMaxY,
  setMachineMaxRadius,
  setMachineRectOrigin,
  setMachineSize,
  setMachineSlider,
  toggleMachineEndpoints
} from './machineSlice'

describe('machine reducer', () => {
  it('should handle initial state', () => {
    expect(machine(undefined, {})).toEqual({
      rectangular: true,
      min_x: 0,
      max_x: 500,
      min_y: 0,
      max_y: 500,
      max_radius: 250,
      rect_origin: [],
      polar_endpoints: false,
      polar_expanded: false,
      rect_expanded: false,
      canvas_width: 600,
      canvas_height: 600,
      sliderValue: 0
    })
  })

  it('should handle toggleMachineRectExpanded', () => {
    expect(
      machine(
        {rectangular: false},
        toggleMachineRectExpanded({})
      )
    ).toEqual({
      rectangular: true,
      rect_expanded: true,
      polar_expanded: false
    })
  })

  it('should handle toggleMachinePolarExpanded', () => {
    expect(
      machine(
        {rectangular: true},
        toggleMachinePolarExpanded({})
      )
    ).toEqual({
      rectangular: false,
      rect_expanded: false,
      polar_expanded: true
    })
  })

  it('should handle setMachineSetMinX', () => {
    expect(
      machine(
        {min_x: 0},
        setMachineMinX(2)
      )
    ).toEqual({
      min_x: 2
    })
  })

  it('should handle setMachineMaxX', () => {
    expect(
      machine(
        {max_x: 0},
        setMachineMaxX(2)
      )
    ).toEqual({
      max_x: 2
    })
  })

  it('should handle setMachineMinY', () => {
    expect(
      machine(
        {min_y: 0},
        setMachineMinY(2)
      )
    ).toEqual({
      min_y: 2
    })
  })

  it('should handle setMachineMaxY', () => {
    expect(
      machine(
        {max_y: 0},
        setMachineMaxY(2)
      )
    ).toEqual({
      max_y: 2
    })
  })

  it('should handle setMachineMaxRadius', () => {
    expect(
      machine(
        {max_radius: 0},
        setMachineMaxRadius(2)
      )
    ).toEqual({
      max_radius: 2
    })
  })

  it('should handle setMachineRectOrigin', () => {
    expect(
      machine(
        {rect_origin: [2]},
        setMachineRectOrigin([2, 3])
      )
    ).toEqual({
      rect_origin: [3]
    })
  })

  it('should handle toggleMachineEndpoints', () => {
    expect(
      machine(
        {polar_endpoints: false},
        toggleMachineEndpoints({})
      )
    ).toEqual({
      polar_endpoints: true
    })

    expect(
      machine(
        {polar_endpoints: true},
        toggleMachineEndpoints({})
      )
    ).toEqual({
      polar_endpoints: false
    })
  })

  it('should handle setMachineSize', () => {
    expect(
      machine(
        {canvas_width: 600, canvas_height: 600},
        setMachineSize(800)
      )
    ).toEqual({
      canvas_width: 800,
      canvas_height: 800
    })
  })

  it('should handle setMachineSlider', () => {
    expect(
      machine(
        {sliderValue: 0.0},
        setMachineSlider(4.0)
      )
    ).toEqual({
      sliderValue: 4.0
    })
  })
})
