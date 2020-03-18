import gcode, {
  setGCodeFilename,
  setGCodePre,
  setGCodePost,
  setGCodeShow,
  toggleGCodeReverse,
} from './gCodeSlice'

describe('gCode reducer', () => {
  it('should handle initial state', () => {
    expect(gcode(undefined, {})).toEqual({
      filename: 'sandify',
      pre: '',
      post: '',
      reverse: false,
      show: false
    })
  })

  it('should handle setGCodeFilename', () => {
    expect(
      gcode(
        {filename: ''},
        setGCodeFilename('test_filename')
      )
    ).toEqual({
      filename: 'test_filename'
    })
  })

  it('should handle setGCodePre', () => {
    expect(
      gcode(
        {pre: ''},
        setGCodePre('pre')
      )
    ).toEqual({
      pre: 'pre'
    })
  })

  it('should handle setGCodePost', () => {
    expect(
      gcode(
        {post: ''},
        setGCodePost('post')
      )
    ).toEqual({
      post: 'post'
    })
  })

  it('should handle toggleGCodeReverse', () => {
    expect(
      gcode(
        {reverse: true},
        toggleGCodeReverse({})
      )
    ).toEqual({
      reverse: false
    })
  })

  it('should handle setGCodeShow', () => {
    expect(
      gcode(
        {show: false},
        setGCodeShow(true)
      )
    ).toEqual({
      show: true
    })
  })
})
