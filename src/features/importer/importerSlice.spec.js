import file, {
  updateImporter,
  toggleFileAspectRatio
} from './importerSlice'

describe('file reducer', () => {
  it('should handle initial state', () => {
    expect(file(undefined, {})).toEqual({
      name: "",
      comments: [],
      vertices: [],
      zoom: 100,
      originalAspectRatio: 1.0,
      aspectRatio: false,
    })
  })

  it('should handle updateImporter', () => {
    expect(
      file(
        {vertices: []},
        updateImporter({vertices: [{'x': 1, 'y': 1}] })
      )
    ).toEqual({
      vertices: [{'x': 1, 'y': 1}]
    })
  })

  it('should handle toggleFileAspectRatio', () => {
    expect(
      file(
        {aspectRatio: false},
        toggleFileAspectRatio({})
      )
    ).toEqual({
      aspectRatio: true
    })
  })
})
