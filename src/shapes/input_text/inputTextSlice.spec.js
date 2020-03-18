import inputText, {
  setShapeInputText,
  setShapeInputFont
} from './inputTextSlice'

describe('inputText reducer', () => {
  it('should handle setShapeInputText', () => {
    expect(
      inputText(
        {input_text: 'Sandify'},
        setShapeInputText('Happy Birthday')
      )
    ).toEqual({
      input_text: 'Happy Birthday'
    })
  })

  it('should handle setShapeInputFont', () => {
    expect(
      inputText(
        {input_font: 'Cursive'},
        setShapeInputFont('Monospace')
      )
    ).toEqual({
      input_font: 'Monospace'
    })
  })
})
