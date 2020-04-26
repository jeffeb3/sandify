const importerOptions = {
  zoom: {
    title: 'Zoom',
    min: 1
  },
  aspectRatio: {
    title: 'Keep original aspect ratio',
    type: 'checkbox',
  },
}

export default class Importer {
  getOptions() {
    return importerOptions
  }
}
