// https://fonts.google.com/attribution; see NOTICE for license details
// Bubblegum, EBGaramond, Holtwood, Lobster, Montserrat, Rouge, NotoEmoji - SIL Open Font License 1.1
// OpenSans, Roboto, Mountains of Christmas - Apache License 2.0
// SourceHanSerifCN - SIL Open Font License 1.1, Copyright 2017-2022 Adobe

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import opentype from "opentype.js"

const globalFonts = {}
export const supportedFonts = {
  "fonts/BubblegumSans-Regular.ttf": "Bubblegum Sans",
  "fonts/EBGaramond-Regular.ttf": "Garamond",
  "fonts/HoltwoodOneSC-Regular.ttf": "Holtwood",
  "fonts/Lobster-Regular.ttf": "Lobster",
  "fonts/Montserrat-Bold.ttf": "Montserrat",
  "fonts/NotoEmoji-VariableFont_wght.ttf": "Noto Emoji",
  "fonts/OpenSans-Regular.ttf": "Open Sans",
  "fonts/Roboto-Black.ttf": "Roboto",
  "fonts/RougeScript-Regular.ttf": "Rouge Script",
  "fonts/MountainsofChristmas-Regular.ttf": "Mountains of Christmas",
  "fonts/SourceHanSerifCN-Regular.ttf": "Source Han Serif",
  "fonts/SourceHanSerifCN-Bold.ttf": "Source Han Serif Bold",
}

const fontNameToUrl = Object.fromEntries(
  Object.entries(supportedFonts).map(([url, name]) => [name, url]),
)

// Load font by URL
export const loadFont = createAsyncThunk(
  "fonts/getFont",
  async (url, { getState }) => {
    const fontName = supportedFonts[url]

    if (globalFonts[fontName]) {
      return fontName
    }

    const font = await opentype.load(url)
    globalFonts[fontName] = font
    return fontName
  },
  {
    condition: (url, { getState }) => {
      const fontName = supportedFonts[url]
      const state = getState().fonts

      return !state.loadedFonts[fontName] && !state.loadingFonts[fontName]
    },
  },
)

export const loadFontByName = createAsyncThunk(
  "fonts/loadByName",
  async (fontName, { dispatch }) => {
    const url = fontNameToUrl[fontName]

    if (!url) {
      throw new Error(`Unknown font: ${fontName}`)
    }

    await dispatch(loadFont(url))

    return fontName
  },
  {
    condition: (fontName, { getState }) => {
      const state = getState().fonts

      return !state.loadedFonts[fontName] && !state.loadingFonts[fontName]
    },
  },
)

export const getFont = (name) => {
  return globalFonts[name]
}

export const fontsSlice = createSlice({
  name: "fonts",
  initialState: {
    loadedFonts: {},
    loadingFonts: {},
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadFont.pending, (state, action) => {
        const url = action.meta.arg
        const fontName = supportedFonts[url]
        state.loadingFonts[fontName] = true
      })
      .addCase(loadFont.fulfilled, (state, action) => {
        const fontName = action.payload
        state.loadedFonts[fontName] = true
        delete state.loadingFonts[fontName]
      })
      .addCase(loadFont.rejected, (state, action) => {
        const url = action.meta.arg
        const fontName = supportedFonts[url]
        delete state.loadingFonts[fontName]
      })
  },
})

// Selectors
export const selectFontLoaded = (state, fontName) =>
  !!state.fonts.loadedFonts[fontName]

export const selectFontLoading = (state, fontName) =>
  !!state.fonts.loadingFonts[fontName]

export default fontsSlice.reducer
