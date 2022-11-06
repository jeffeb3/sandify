import app, { chooseInput } from './appSlice'

describe('app reducer', () => {
  it('should handle initial state', () => {
    expect(app(undefined, {})).toEqual({
      sandifyVersion: "0.2.8", // Also change the version in package.json.
      input: 'shape',
    })
  })

  it('should handle chooseInput', () => {
    expect(
      app(
        {input: 'shape'},
        chooseInput('code')
      )
    ).toEqual({
      input: 'code'
    })
  })
})
