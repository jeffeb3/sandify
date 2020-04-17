import machine, {
  updateMachine,
  toggleMachineRectExpanded,
  toggleMachinePolarExpanded,
  setMachineRectOrigin,
  setMachineSize,
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
      minimizeMoves: false,
      rectOrigin: [],
      polarStartPoint: 'none',
      polarEndPoint: 'none',
      polarExpanded: false,
      rectExpanded: false,
      canvasWidth: 600,
      canvasHeight: 600,
      sliderValue: 0
    })
  })

  it('should handle updateMachine', () => {
    expect(
      machine(
        {minX: 0, maxX: 0},
        updateMachine({minX: 50, maxX: 50})
      )
    ).toEqual({
      minX: 50,
      maxX: 50
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
})
