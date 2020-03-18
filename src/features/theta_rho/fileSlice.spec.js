import file, {
  setFileName,
  setFileVertices,
  setFileComments,
  setFileZoom,
  toggleFileAspectRatio
} from './fileSlice'

describe('file reducer', () => {
  it('should handle initial state', () => {
    expect(file(undefined, {})).toEqual({
      name: "",
      comments: [],
      vertices: [],
      zoom: 100,
      aspect_ratio: false,
    })
  })

  it('should handle setFileName', () => {
    expect(
      file(
        {name: ''},
        setFileName('test_name')
      )
    ).toEqual({
      name: 'test_name'
    })
  })

  it('should handle setFileVertices', () => {
    expect(
      file(
        {vertices: []},
        setFileVertices([{'x': 1, 'y': 1}])
      )
    ).toEqual({
      vertices: [{'x': 1, 'y': 1}]
    })
  })

  it('should handle setFileComments', () => {
    expect(
      file(
        {comments: ''},
        setFileComments('comments')
      )
    ).toEqual({
      comments: 'comments'
    })
  })

  it('should handle setFileZoom', () => {
    expect(
      file(
        {zoom: 50},
        setFileZoom(50)
      )
    ).toEqual({
      zoom: 50
    })
  })

  it('should handle toggleFileAspectRatio', () => {
    expect(
      file(
        {aspect_ratio: false},
        toggleFileAspectRatio({})
      )
    ).toEqual({
      aspect_ratio: true
    })
  })
})
