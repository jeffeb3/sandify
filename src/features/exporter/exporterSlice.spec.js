import exporter, {
  updateExporter
} from './exporterSlice'

describe('exporter reducer', () => {
  it('should handle initial state', () => {
    expect(exporter(undefined, {})).toEqual({
      fileName: 'sandify',
      fileType: 'GCode (.gcode)',
      polarRhoMax: 1,
      pre: '',
      post: '',
      reverse: false,
      show: false
    })
  })

  it('should handle updateExporter', () => {
    expect(
      exporter(
        {filename: ''},
        updateExporter({filename: 'test_filename'})
      )
    ).toEqual({
      filename: 'test_filename'
    })
  })
})
