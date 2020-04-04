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
      minX: 0,
      maxX: 500,
      minY: 0,
      maxY: 500,
      maxRadius: 250,
      rectOrigin: [],
      polarEndpoints: false,
      polarExpanded: false,
      rectExpanded: false,
      canvasWidth: 600,
      canvasHeight: 600,
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
      rectExpanded: true,
      polarExpanded: false
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
      rectExpanded: false,
      polarExpanded: true
    })
  })

  it('should handle setMachineSetMinX', () => {
    expect(
      machine(
        {minX: 0},
        setMachineMinX(2)
      )
    ).toEqual({
      minX: 2
    })
  })

  it('should handle setMachineMaxX', () => {
    expect(
      machine(
        {maxX: 0},
        setMachineMaxX(2)
      )
    ).toEqual({
      maxX: 2
    })
  })

  it('should handle setMachineMinY', () => {
    expect(
      machine(
        {minY: 0},
        setMachineMinY(2)
      )
    ).toEqual({
      minY: 2
    })
  })

  it('should handle setMachineMaxY', () => {
    expect(
      machine(
        {maxY: 0},
        setMachineMaxY(2)
      )
    ).toEqual({
      maxY: 2
    })
  })

  it('should handle setMachineMaxRadius', () => {
    expect(
      machine(
        {maxRadius: 0},
        setMachineMaxRadius(2)
      )
    ).toEqual({
      maxRadius: 2
    })
  })

  it('should handle setMachineRectOrigin', () => {
    expect(
      machine(
        {rectOrigin: [2]},
        setMachineRectOrigin([2, 3])
      )
    ).toEqual({
      rectOrigin: [3]
    })
  })

  it('should handle toggleMachineEndpoints', () => {
    expect(
      machine(
        {polarEndpoints: false},
        toggleMachineEndpoints({})
      )
    ).toEqual({
      polarEndpoints: true
    })

    expect(
      machine(
        {polarEndpoints: true},
        toggleMachineEndpoints({})
      )
    ).toEqual({
      polarEndpoints: false
    })
  })

  it('should handle setMachineSize', () => {
    expect(
      machine(
        {canvasWidth: 600, canvasHeight: 600},
        setMachineSize(800)
      )
    ).toEqual({
      canvasWidth: 800,
      canvasHeight: 800
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
