import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import opentype from 'opentype.js'

const globalFonts = {}
export const supportedFonts = {
  'fonts/BubblegumSans-Regular.ttf': 'Bubblegum Sans',
  'fonts/EBGaramond-Regular.ttf': 'Garamond',
  'fonts/HoltwoodOneSC-Regular.ttf': 'Holtwood',
  'fonts/Lobster-Regular.ttf': 'Lobster',
  'fonts/Montserrat-Bold.ttf': 'Montserrat',
  'fonts/OpenSans-Regular.ttf': 'Open Sans',
  'fonts/Roboto-Black.ttf': 'Roboto',
  'fonts/RougeScript-Regular.ttf': 'Rouge Script',
  'fonts/MountainsofChristmas-Regular.ttf': 'Mountains of Christmas'
}

export const loadFont = createAsyncThunk(
  'fonts/getFont',
  async (url) => {
    const font = await opentype.load(url)
    const fontName = supportedFonts[url]

    globalFonts[fontName] = font
    return fontName
})

export const getFont = (name) => {
  return globalFonts[name]
}

export const fontsSlice = createSlice({
  name: 'fonts',
  initialState: {
    fonts: [],
    loaded: false
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadFont.fulfilled, (state, action) => {
      state.fonts.push(action.payload)
      state.loaded = state.fonts.length === supportedFonts.length
    })
  }
})

export default fontsSlice.reducer
