import importer, {
    showImportPattern,
    showImportImage,
    showImagePreview,
    setReverseImageIntensity,
    setImageThreshold,
} from './importerSlice'

describe('importer reducer', () => {
  it('should handle initial state', () => {
    expect(importer(undefined, {})).toEqual({
      showImportPattern: false,
      showImportImage: false,
      showImagePreview: false,
      reverseImageIntensity: false,
      imageThreshold: 127,
    })
  })

  it('should handle showImportPattern', () => {
    expect(
      importer(
        {showImportPattern: true},
        showImportPattern(false)
      )
    ).toEqual({
      showImportPattern: false
    })
  })

  it('should handle showImportImage', () => {
    expect(
      importer(
        {showImportImage: true},
        showImportImage(false)
      )
    ).toEqual({
      showImportImage: false
    })
  })

  it('should handle showImagePreview', () => {
    expect(
      importer(
        {showImagePreview: true},
        showImagePreview(false)
      )
    ).toEqual({
      showImagePreview: false
    })
  })

  it('should handle setReverseImageIntensity', () => {
    expect(
      importer(
        {reverseImageIntensity: true},
        setReverseImageIntensity(false)
      )
    ).toEqual({
      reverseImageIntensity: false
    })
  })

  it('should handle setImageThreshold', () => {
    expect(
      importer(
        {imageThreshold: 127},
        setImageThreshold(100)
      )
    ).toEqual({
      imageThreshold: 100
    })
  })
})
