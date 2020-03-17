import app, {
  chooseInput
} from './appSlice'

describe('app reducer', () => {
  it('should handle initial state', () => {
    expect(app(undefined, {})).toEqual({
      sandifyVersion: "0.1.7", // Also change the version in package.json.
      input: 0,
    })
  })

  it('should handle chooseInput', () => {
    expect(
      app(
        {input: 0},
        chooseInput(1)
      )
    ).toEqual({
      input: 1
    })
  })

})
